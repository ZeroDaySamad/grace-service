import express from 'express';

const router = express.Router();

export default function cartRoutes(db) {
  // Sync LocalStorage to Database on Login
  router.post('/sync', async (req, res) => {
    try {
      const { userId, items } = req.body;

      if (!userId || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Données de synchronisation invalides' });
      }

      for (const item of items) {
        // Upsert logic for each cart item
        const existing = await db.get('SELECT * FROM CartItem WHERE userId = ? AND productId = ?', [userId, item.id]);
        if (existing) {
          await db.run('UPDATE CartItem SET quantity = quantity + ? WHERE id = ?', [item.quantity, existing.id]);
        } else {
          await db.run('INSERT INTO CartItem (userId, productId, quantity) VALUES (?, ?, ?)', [userId, item.id, item.quantity]);
        }
      }

      res.json({ message: 'Panier synchronisé avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la synchronisation du panier' });
    }
  });

  // Get user's cart
  router.get('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const cart = await db.all(`
        SELECT c.*, p.name, p.price, p.image, p.category 
        FROM CartItem c JOIN Product p ON c.productId = p.id
        WHERE c.userId = ?
      `, [userId]);
      res.json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération du panier' });
    }
  });

  // Add item to cart
  router.post('/add', async (req, res) => {
      try {
          const { userId, productId, quantity } = req.body;
          const existing = await db.get('SELECT * FROM CartItem WHERE userId = ? AND productId = ?', [userId, productId]);
          if (existing) {
              await db.run('UPDATE CartItem SET quantity = quantity + ? WHERE id = ?', [quantity || 1, existing.id]);
          } else {
              await db.run('INSERT INTO CartItem (userId, productId, quantity) VALUES (?, ?, ?)', [userId, productId, quantity || 1]);
          }
          res.json({ message: 'Produit ajouté au panier' });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de l’ajout au panier' });
      }
  });

  return router;
}
