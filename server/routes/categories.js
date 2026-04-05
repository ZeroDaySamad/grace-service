import express from 'express';

export default function categoryRoutes(db) {
  const router = express.Router();

  // Get all categories
  router.get('/', async (req, res) => {
    try {
      const categories = await db.all('SELECT name FROM Category');
      res.json(categories.map(c => c.name));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
  });

  return router;
}
