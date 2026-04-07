import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Import des routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
import adminRoutes from './routes/admin.js';
import categoryRoutes from './routes/categories.js';
import settingsRoutes from './routes/settings.js';

import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Prisma Client
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Middleware de Sécurité & Logging
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false, // Disable CSP — React build uses inline scripts
}));
app.use(morgan('dev'));

// Rate Limiting (Protection brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});
app.use('/api/', limiter);

// Configuration CORS restreinte en production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin requests (no origin header) and allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API Routes (on passe prisma à chaque route)
app.use('/api/auth', authRoutes(prisma));
app.use('/api/products', productRoutes(prisma));
app.use('/api/users', userRoutes(prisma));
app.use('/api/cart', cartRoutes(prisma));
app.use('/api/admin', adminRoutes(prisma));
app.use('/api/categories', categoryRoutes(prisma));
app.use('/api/settings', settingsRoutes(prisma));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: 'Prisma + Neon',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== PRODUCTION : Servir le Frontend React ====================
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, '../dist');
  
  app.use(express.static(clientBuildPath));

  // Catch-all middleware for SPA navigation - serves index.html for any non-API route
  app.use((req, res, next) => {
    // If it's an API route or an existing file (handled by express.static), skip
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;