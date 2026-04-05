import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'easymarkey_secret_key';

export default function authRoutes(db) {
  // Register
  router.post('/register', async (req, res) => {
    try {
      const { nom, prenom, whatsapp, email, password } = req.body;

      if (!nom || !prenom || !whatsapp || !password) {
        return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
      }

      // Check if user exists
      const existingUser = await db.get('SELECT * FROM User WHERE whatsapp = ?', [whatsapp]);
      if (existingUser) {
        return res.status(400).json({ error: 'Ce numéro WhatsApp est déjà utilisé' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await db.run(
        'INSERT INTO User (nom, prenom, whatsapp, email, password) VALUES (?, ?, ?, ?, ?)',
        [nom, prenom, whatsapp, email, hashedPassword]
      );

      res.status(201).json({ message: 'Utilisateur créé avec succès', userId: result.lastID });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l’inscription' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { whatsapp, password } = req.body;

      if (!whatsapp || !password) {
        return res.status(400).json({ error: 'Numéro WhatsApp et mot de passe requis' });
      }

      const user = await db.get('SELECT * FROM User WHERE whatsapp = ?', [whatsapp]);
      if (!user) {
        return res.status(400).json({ error: 'Utilisateur non trouvé' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Mot de passe incorrect' });
      }

      // Create JWT
      const token = jwt.sign(
        { id: user.id, role: user.role, plan_status: user.plan_status },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Don't send password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  });

  return router;
}
