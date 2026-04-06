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

export default function settingsRoutes(prisma) {
    // GET setting by key (Public)
    router.get('/:key', async (req, res) => {
        try {
            const { key } = req.params;
            const setting = await prisma.settings.findUnique({
                where: { key }
            });
            if (!setting) return res.status(404).json({ error: 'Paramètre introuvable' });
            res.json(setting);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la lecture du paramètre' });
        }
    });

    // UPDATE setting (Admin only)
    router.patch('/:key', verifyAdmin, async (req, res) => {
        try {
            const { key } = req.params;
            const { value } = req.body;

            if (!value) return res.status(400).json({ error: 'La valeur est requise' });

            const setting = await prisma.settings.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            });

            res.json({ message: 'Paramètre mis à jour', key: setting.key, value: setting.value });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }
    });

    return router;
}
