import express from 'express';

const router = express.Router();

export default function cartRoutes(prisma) {
  // Sync LocalStorage to Database on Login
  router.post('/sync', async (req, res) => {
    try {
      const { userId, items } = req.body;
      const uId = parseInt(userId);

      if (!uId || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Données de synchronisation invalides' });
      }

      for (const item of items) {
        // Use Prisma upsert for each cart item
        await prisma.cartItem.upsert({
          where: {
            userId_productId: {
              userId: uId,
              productId: parseInt(item.id)
            }
          },
          update: {
            quantity: { increment: item.quantity }
          },
          create: {
            userId: uId,
            productId: parseInt(item.id),
            quantity: item.quantity
          }
        });
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
      const rawCart = await prisma.cartItem.findMany({
        where: { userId: parseInt(userId) },
        include: {
          product: {
            include: {
              seller: true
            }
          }
        }
      });

      // Flatten structure to match old SQL format
      const cart = rawCart.map(c => ({
        ...c,
        name: c.product.name,
        price: c.product.price,
        image: c.product.image,
        category: c.product.category,
        sellerId: c.product.sellerId,
        sellerPhone: c.product.seller.whatsapp,
        sellerName: c.product.seller.nom
      }));

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
          const uId = parseInt(userId);
          const pId = parseInt(productId);

          await prisma.cartItem.upsert({
            where: {
              userId_productId: {
                userId: uId,
                productId: pId
              }
            },
            update: {
              quantity: { increment: quantity || 1 }
            },
            create: {
              userId: uId,
              productId: pId,
              quantity: quantity || 1
            }
          });

          res.json({ message: 'Produit ajouté au panier' });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de l’ajout au panier' });
      }
  });

  // Update item quantity
  router.patch('/item/:id', async (req, res) => {
      try {
          const { id } = req.params;
          const { quantity } = req.body;
          await prisma.cartItem.update({
            where: { id: parseInt(id) },
            data: { quantity: parseInt(quantity) }
          });
          res.json({ message: 'Quantité mise à jour' });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la mise à jour' });
      }
  });

  // Delete item from cart
  router.delete('/item/:id', async (req, res) => {
      try {
          const { id } = req.params;
          await prisma.cartItem.delete({
            where: { id: parseInt(id) }
          });
          res.json({ message: 'Produit retiré du panier' });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la suppression' });
      }
  });

  // Clear user's cart
  router.delete('/clear/:userId', async (req, res) => {
      try {
          const { userId } = req.params;
          await prisma.cartItem.deleteMany({
            where: { userId: parseInt(userId) }
          });
          res.json({ message: 'Panier vidé' });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la suppression du panier' });
      }
  });

  return router;
}
