import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function query() {
  const products = await prisma.product.findMany();
  console.log("PRODUCTS:", products);

  const users = await prisma.user.findMany();
  console.log("USERS:", users);
  
  await prisma.$disconnect();
}
query();
