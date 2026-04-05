import express from 'express';

const router = express.Router();

export default function productRoutes(db) {
  // Get all products (only from active pros)
  router.get('/', async (req, res) => {
    try {
      const products = await db.all(`
        SELECT p.*, u.nom as sellerName, u.whatsapp as sellerPhone, u.avatar as sellerAvatar, u.plan_status, u.plan_expiry 
        FROM Product p JOIN User u ON p.sellerId = u.id
      `);
      
      const now = new Date();
      const activeProducts = products.filter(p => {
          if (p.plan_status !== 'ACTIVE') return false;
          if (!p.plan_expiry) return false; // Should not happen for active plans
          const expiry = new Date(p.plan_expiry);
          return expiry >= now;
      });

      res.json(activeProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
  });

  // Track WhatsApp click
  router.post('/:id/click', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('UPDATE Product SET whatsapp_clicks = whatsapp_clicks + 1 WHERE id = ?', [id]);
      res.json({ message: 'Clic enregistré' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l’enregistrement du clic' });
    }
  });

  // Add product (Active Pros only)
  router.post('/add', async (req, res) => {
    try {
      const { name, description, price, image, category, sellerId } = req.body;
      
      const user = await db.get('SELECT * FROM User WHERE id = ?', [sellerId]);
      
      const now = new Date();
      const isExpired = user.plan_expiry ? new Date(user.plan_expiry) < now : true;

      if (!user || user.role !== 'PRO' || user.plan_status !== 'ACTIVE' || isExpired) {
        return res.status(403).json({ error: 'Vous devez avoir un compte PRO actif (non expiré) pour vendre des produits' });
      }

      const result = await db.run(
        'INSERT INTO Product (name, description, price, image, category, sellerId) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, image, category, sellerId]
      );
      res.status(201).json({ id: result.lastID, message: 'Produit ajouté avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l’ajout du produit' });
    }
  });

  // Get vendor statistics
  router.get('/vendor/:id/stats', async (req, res) => {
      try {
          const { id } = req.params;
          const stats = await db.all('SELECT id, name, whatsapp_clicks FROM Product WHERE sellerId = ?', [id]);
          res.json(stats);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
      }
  });

  return router;
}
