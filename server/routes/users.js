import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
  }
});

const IMGBB_API_KEY = 'a5860fb366409a5bcec18fbcee191fb9';
const JWT_SECRET = process.env.JWT_SECRET || 'easymarkey_secret_key';

// Middleware to verify Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Accès non autorisé' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Session expirée' });
    }
};

async function uploadToImgBB(fileBuffer, fileName) {
    const formData = new URLSearchParams();
    formData.append('image', fileBuffer.toString('base64'));
    formData.append('key', IMGBB_API_KEY);
    formData.append('name', `avatar_${Date.now()}_${fileName}`);

    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    });

    const data = await response.json();
    if (data.success) {
        return data.data.url;
    } else {
        throw new Error(data.error?.message || 'Erreur lors de l\'upload sur ImgBB');
    }
}

export default function userRoutes(prisma) {
  // Get user profile
  router.get('/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      
      // Safety: Only allow if it's the same user or if it's an admin
      if (userId !== req.userId && req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Interdit : Vous ne pouvez accéder qu’à votre propre profil' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nom: true,
          prenom: true,
          whatsapp: true,
          email: true,
          ville: true,
          role: true,
          avatar: true,
          plan_status: true,
          plan_type: true,
          plan_expiry: true
        }
      });

      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
  });

  // Update Avatar
  router.patch('/:id/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
      try {
          const { id } = req.params;
          const userId = parseInt(id);
          if (userId !== req.userId) {
              return res.status(403).json({ error: 'Interdit : Vous ne pouvez modifier que votre propre avatar' });
          }
          if (!req.file) return res.status(400).json({ error: 'Fichier image requis' });

          const avatarUrl = await uploadToImgBB(req.file.buffer, req.file.originalname);
          
          await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl }
          });
          
          res.json({ message: 'Photo de profil mise à jour', avatar: avatarUrl });
      } catch (error) {
          console.error('Avatar Update Error:', error);
          res.status(500).json({ error: 'Erreur lors de la mise à jour de la photo: ' + error.message });
      }
  });

  // Upgrade to Pro (Initial Request)
  router.patch('/:id/upgrade', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      if (userId !== req.userId) {
        return res.status(403).json({ error: 'Action non autorisée' });
      }
      const { ville, plan_type } = req.body;

      if (!ville || !plan_type) {
        return res.status(400).json({ error: 'Ville et type de plan requis' });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          ville,
          plan_type,
          plan_status: 'PENDING'
        }
      });

      res.json({ message: 'Demande de passage en PRO enregistrée. En attente d’activation.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la demande d’upgrade' });
    }
  });

  // Update profile basic info (name/prenom)
  router.patch('/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      if (userId !== req.userId) {
        return res.status(403).json({ error: 'Action non autorisée' });
      }
      const { nom, prenom } = req.body;
      
      if (!nom || !prenom) {
        return res.status(400).json({ error: 'Nom et prénom requis' });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { nom, prenom }
      });
      res.json({ message: 'Profil mis à jour' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
  });

  // Delete account with password verification
  router.post('/:id/delete', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      if (userId !== req.userId) {
        return res.status(403).json({ error: 'Action non autorisée' });
      }
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Mot de passe requis pour la suppression' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
      }

      // Delete user's products and cart items (Prisma cascade delete or manual)
      await prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { userId: userId } }),
        prisma.product.deleteMany({ where: { sellerId: userId } }),
        prisma.user.delete({ where: { id: userId } })
      ]);

      res.json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
    }
  });

  // Admin Activation Mock
  router.patch('/:id/activate', async (req, res) => {
      try {
          const { id } = req.params;
          await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
              plan_status: 'ACTIVE',
              role: 'PRO'
            }
          });
          res.json({ message: 'Compte PRO activé avec succès' });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de l’activation' });
      }
  });

  return router;
}
