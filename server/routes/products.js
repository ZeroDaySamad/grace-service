import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const JWT_SECRET = process.env.JWT_SECRET || 'easymarkey_secret_key';

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Accès non autorisé' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Session expirée' });
    }
};

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
    }
  }
});

async function uploadToImgBB(fileBuffer, fileName) {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
        throw new Error("IMGBB_API_KEY manquante côté serveur (variable d'environnement)");
    }
    const formData = new URLSearchParams();
    formData.append('image', fileBuffer.toString('base64'));
    formData.append('key', apiKey);
    formData.append('name', fileName);

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

export default function productRoutes(prisma) {
  // Get all products (with pagination and filters)
  router.get('/', async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category = 'Tout', 
        search = '', 
        minPrice = '', 
        maxPrice = '' 
      } = req.query;

      const safePage = Math.max(1, parseInt(page, 10) || 1);
      const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
      const offset = (safePage - 1) * safeLimit;

      const now = new Date();

      // Build WHERE object for Prisma
      const whereClause = {
        seller: {
          plan_status: 'ACTIVE',
          plan_expiry: {
            gte: now
          }
        }
      };

      if (category !== 'Tout') {
        whereClause.category = category;
      }

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const minP = parseFloat(minPrice);
      if (!isNaN(minP)) {
        whereClause.price = { ...whereClause.price, gte: minP };
      }

      const maxP = parseFloat(maxPrice);
      if (!isNaN(maxP)) {
        whereClause.price = { ...whereClause.price, lte: maxP };
      }

      // Count total matches
      const total = await prisma.product.count({ where: whereClause });
      const totalPages = Math.ceil(total / safeLimit);

      // Get paginated products with seller info
      const rawProducts = await prisma.product.findMany({
        where: whereClause,
        include: {
          seller: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: safeLimit
      });

      // Map to flatten structure (to match old SQL format)
      const products = rawProducts.map(p => ({
        ...p,
        sellerName: p.seller.nom,
        sellerPrenom: p.seller.prenom,
        sellerPhone: p.seller.whatsapp,
        sellerVille: p.seller.ville,
        sellerAvatar: p.seller.avatar,
        plan_status: p.seller.plan_status,
        plan_expiry: p.seller.plan_expiry
      }));
      
      res.json({
        products,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages
        }
      });
    } catch (error) {
      console.error('SERVER PRODUCT ERROR:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
  });

  // Get single product
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const p = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          seller: true
        }
      });
      
      if (!p) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      // Flatten structure
      const product = {
        ...p,
        sellerName: p.seller.nom,
        sellerPrenom: p.seller.prenom,
        sellerPhone: p.seller.whatsapp,
        sellerVille: p.seller.ville,
        sellerAvatar: p.seller.avatar,
        plan_status: p.seller.plan_status,
        plan_expiry: p.seller.plan_expiry
      };

      // Check if seller is active
      const now = new Date();
      const isExpired = product.plan_expiry && new Date(product.plan_expiry) < now;
      if (product.plan_status !== 'ACTIVE' || isExpired) {
        return res.status(403).json({ error: 'Ce produit n’est plus disponible (vendeur inactif)' });
      }

      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
    }
  });

  // Track WhatsApp click
  router.post('/:id/click', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          whatsapp_clicks: {
            increment: 1
          }
        }
      });
      res.json({ message: 'Clic enregistré' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de l’enregistrement du clic' });
    }
  });

  // Add product (Active Pros only)
  router.post('/add', verifyToken, upload.single('image'), async (req, res) => {
    try {
      console.log('=== POST /add REQUEST (ImgBB) ===');
      const { name, description, price, category, ville } = req.body;
      const sellerId = req.userId;
      
      if (!name || !description || !price || !category) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Une image est requise' });
      }

      const user = await prisma.user.findUnique({
        where: { id: sellerId }
      });
      
      const now = new Date();
      const isExpired = user.plan_expiry ? new Date(user.plan_expiry) < now : true;

      if (!user || user.role !== 'PRO' || user.plan_status !== 'ACTIVE' || isExpired) {
        return res.status(403).json({ error: 'Vous devez avoir un compte PRO actif (non expiré) pour vendre des produits' });
      }

      // Upload to ImgBB
      const imagePath = await uploadToImgBB(req.file.buffer, req.file.originalname);

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          image: imagePath,
          category,
          sellerId: sellerId,
          ville: ville || user.ville
        }
      });
      
      res.status(201).json({ 
        id: product.id, 
        message: 'Produit ajouté avec succès (ImgBB)',
        image: imagePath
      });
    } catch (error) {
      console.error('=== POST /add ERROR (ImgBB) ===', error);
      res.status(500).json({ error: "Erreur lors de l'ajout du produit: " + error.message });
    }
  });

  // Get vendor statistics
  router.get('/vendor/:id/stats', async (req, res) => {
      try {
          const { id } = req.params;
          const products = await prisma.product.findMany({
            where: { sellerId: parseInt(id) },
            orderBy: { createdAt: 'desc' }
          });
          res.json(products);
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
      }
  });

  // Delete a product
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        select: { sellerId: true }
      });
      
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
      
      if (product.sellerId !== req.userId && req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Action non autorisée' });
      }

      // Prisma handles cascade delete if set up in schema, but SQLite/Postgres might need manual check.
      // CartItem has a relation to Product.
      await prisma.cartItem.deleteMany({
        where: { productId: parseInt(id) }
      });
      
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });

      res.json({ message: 'Produit supprimé' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  });

  // Edit a product
  router.patch('/:id', verifyToken, upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, category } = req.body;
      
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
      
      if (product.sellerId !== req.userId && req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Action non autorisée' });
      }

      let imagePath = product.image;
      if (req.file) {
        imagePath = await uploadToImgBB(req.file.buffer, req.file.originalname);
      }

      await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          name: name || product.name,
          description: description || product.description,
          price: price ? parseFloat(price) : product.price,
          category: category || product.category,
          image: imagePath
        }
      });

      res.json({ message: 'Produit mis à jour' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la modification du produit' });
    }
  });

  return router;
}
