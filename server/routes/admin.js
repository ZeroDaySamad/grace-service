import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'easymarkey_secret_key';

// Middleware to verify Admin
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Accès non autorisé' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
        }
        req.adminId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Session expirée' });
    }
};

export default function adminRoutes(prisma) {
    // 1. Stats Dashboard
    router.get('/stats', verifyAdmin, async (req, res) => {
        try {
            const usersCount = await prisma.user.count({ where: { role: { not: 'ADMIN' } } });
            const productsCount = await prisma.product.count();
            const proUsersCount = await prisma.user.count({ where: { plan_status: 'ACTIVE' } });
            const totalClicksAgg = await prisma.product.aggregate({
                _sum: { whatsapp_clicks: true }
            });

            res.json({
                totalUsers: usersCount,
                totalProducts: productsCount,
                proUsers: proUsersCount,
                totalWhatsAppClicks: totalClicksAgg._sum.whatsapp_clicks || 0
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la récupération des stats' });
        }
    });

    // 2. User Management
    router.get('/users', verifyAdmin, async (req, res) => {
        try {
            const rawUsers = await prisma.user.findMany({
                where: { role: { not: 'ADMIN' } },
                include: {
                    _count: {
                        select: { products: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Map to include productCount at top level for the frontend
            const users = rawUsers.map(u => ({
                ...u,
                productCount: u._count.products
            }));

            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la liste des utilisateurs' });
        }
    });

    router.delete('/users/:id', verifyAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const uId = parseInt(id);

            // Using transaction for safe deletion
            await prisma.$transaction([
                prisma.cartItem.deleteMany({ where: { userId: uId } }),
                prisma.product.deleteMany({ where: { sellerId: uId } }),
                prisma.user.delete({ where: { id: uId } })
            ]);

            res.json({ message: 'Utilisateur et ses données supprimés avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
    });

    // 3. Plan Activation
    router.patch('/users/:id/activate-plan', verifyAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const { plan_type, duration_months } = req.body; 

            const user = await prisma.user.findUnique({
                where: { id: parseInt(id) },
                select: { plan_status: true }
            });

            if (user?.plan_status === 'ACTIVE') {
                return res.status(400).json({ error: 'Le plan est déjà actif pour cet utilisateur' });
            }

            let expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + (Number(duration_months) || 1));

            await prisma.user.update({
                where: { id: parseInt(id) },
                data: {
                    plan_status: 'ACTIVE',
                    plan_type: plan_type,
                    plan_expiry: expiryDate,
                    role: 'PRO'
                }
            });

            res.json({ message: 'Plan activé avec succès', expiryDate });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de l’activation du plan' });
        }
    });

    router.patch('/users/:id/cancel-plan', verifyAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.user.update({
                where: { id: parseInt(id) },
                data: {
                    plan_status: 'NONE',
                    plan_type: null,
                    plan_expiry: null,
                    role: 'USER'
                }
            });
            res.json({ message: 'Plan annulé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de l’annulation du plan' });
        }
    });

    // 3.5 Reset Password
    router.patch('/users/:id/reset-password', verifyAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const { new_password } = req.body;
            
            if (!new_password) return res.status(400).json({ error: 'Nouveau mot de passe requis' });
            
            const hashedPassword = await bcrypt.hash(new_password, 10);
            
            await prisma.user.update({
                where: { id: parseInt(id) },
                data: { password: hashedPassword }
            });
            
            res.json({ message: 'Mot de passe réinitialisé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
        }
    });

    // 4. Product List
    router.get('/products', verifyAdmin, async (req, res) => {
        try {
            const rawProducts = await prisma.product.findMany({
                include: {
                    seller: true
                },
                orderBy: { createdAt: 'desc' }
            });

            // Match old flattened format
            const products = rawProducts.map(p => ({
                ...p,
                seller_nom: p.seller.nom,
                seller_prenom: p.seller.prenom
            }));

            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la liste des produits' });
        }
    });

    // 5. Add Category
    router.post('/categories', verifyAdmin, async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'Le nom de la catégorie est requis' });
            
            await prisma.category.create({
                data: { name }
            });

            res.json({ message: 'Catégorie ajoutée' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de l’ajout de la catégorie (peut-être existe-t-elle déjà ?)' });
        }
    });

    return router;
}

