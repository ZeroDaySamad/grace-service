import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
import adminRoutes from './routes/admin.js';
import categoryRoutes from './routes/categories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    const db = await initDB();
    console.log('Database initialized successfully');

    // API Routes
    app.use('/api/auth', authRoutes(db));
    app.use('/api/products', productRoutes(db));
    app.use('/api/users', userRoutes(db));
    app.use('/api/cart', cartRoutes(db));
    app.use('/api/admin', adminRoutes(db));
    app.use('/api/categories', categoryRoutes(db));

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', database: 'connected' });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();
