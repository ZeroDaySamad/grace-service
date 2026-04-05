import express from 'express';

const router = express.Router();

export default function userRoutes(db) {
  // Get user profile
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await db.get('SELECT id, nom, prenom, whatsapp, email, ville, role, plan_status, plan_type, plan_expiry FROM User WHERE id = ?', [id]);
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
  });

  // Upgrade to Pro (Initial Request)
  router.patch('/:id/upgrade', async (req, res) => {
    try {
      const { id } = req.params;
      const { ville, plan_type } = req.body;

      if (!ville || !plan_type) {
        return res.status(400).json({ error: 'Ville et type de plan requis' });
      }

      await db.run(
        'UPDATE User SET ville = ?, plan_type = ?, plan_status = "PENDING", role = "USER" WHERE id = ?',
        [ville, plan_type, id]
      );

      res.json({ message: 'Demande de passage en PRO enregistrée. En attente d’activation.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la demande d’upgrade' });
    }
  });

  // Admin Activation Mock
  router.patch('/:id/activate', async (req, res) => {
      try {
          const { id } = req.params;
          await db.run('UPDATE User SET plan_status = "ACTIVE", role = "PRO" WHERE id = ?', [id]);
          res.json({ message: 'Compte PRO activé avec succès' });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de l’activation' });
      }
  });

  return router;
}
