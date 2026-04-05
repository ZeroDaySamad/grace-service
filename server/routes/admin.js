import express from 'express';
import jwt from 'jsonwebtoken';

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

export default function adminRoutes(db) {
    // 1. Stats Dashboard
    router.get('/stats', verifyAdmin, async (req, res) => {
        try {
            const usersCount = await db.get('SELECT COUNT(*) as count FROM User WHERE role != "ADMIN"');
            const productsCount = await db.get('SELECT COUNT(*) as count FROM Product');
            const proUsersCount = await db.get('SELECT COUNT(*) as count FROM User WHERE plan_status = "ACTIVE"');
            const totalClicks = await db.get('SELECT SUM(whatsapp_clicks) as count FROM Product');

            res.json({
                totalUsers: usersCount.count,
                totalProducts: productsCount.count,
                proUsers: proUsersCount.count,
                totalWhatsAppClicks: totalClicks.count || 0
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la récupération des stats' });
        }
    });

    // 2. User Management
    router.get('/users', verifyAdmin, async (req, res) => {
        try {
            const users = await db.all(`
                SELECT u.id, u.nom, u.prenom, u.whatsapp, u.ville, u.plan_status, u.plan_type, u.plan_expiry, u.createdAt,
                (SELECT COUNT(*) FROM Product p WHERE p.sellerId = u.id) as productCount
                FROM User u 
                WHERE u.role != "ADMIN"
                ORDER BY u.createdAt DESC
            `);
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la liste des utilisateurs' });
        }
    });

    router.delete('/users/:id', verifyAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            // Clean up products and cart first (cascading)
            await db.run('DELETE FROM Product WHERE sellerId = ?', [id]);
            await db.run('DELETE FROM CartItem WHERE userId = ?', [id]);
            await db.run('DELETE FROM User WHERE id = ?', [id]);
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
            const { plan_type, duration_months } = req.body; // duration_months: 1 or 3

            let expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + Number(duration_months));

            await db.run(
                'UPDATE User SET plan_status = "ACTIVE", plan_type = ?, plan_expiry = ?, role = "PRO" WHERE id = ?',
                [plan_type, expiryDate.toISOString(), id]
            );

            res.json({ message: 'Plan activé avec succès', expiryDate });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de l’activation du plan' });
        }
    });

    router.patch('/users/:id/cancel-plan', verifyAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            await db.run(
                'UPDATE User SET plan_status = "NONE", plan_type = NULL, plan_expiry = NULL, role = "USER" WHERE id = ?',
                [id]
            );
            res.json({ message: 'Plan annulé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de l’annulation du plan' });
        }
    });

    // 4. Product List
    router.get('/products', verifyAdmin, async (req, res) => {
        try {
            const products = await db.all(`
                SELECT p.*, u.nom as seller_nom, u.prenom as seller_prenom 
                FROM Product p 
                JOIN User u ON p.sellerId = u.id 
                ORDER BY p.createdAt DESC
            `);
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
            await db.run('INSERT INTO Category (name) VALUES (?)', [name]);
            res.json({ message: 'Catégorie ajoutée' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de l’ajout de la catégorie (peut-être existe-t-elle déjà ?)' });
        }
    });

    return router;
}

