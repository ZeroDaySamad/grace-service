import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['query', 'info', 'warn', 'error'] });

async function main() {
  try {
    const res = await prisma.user.create({
      data: {
        nom: 'Debug',
        prenom: 'User',
        whatsapp: '70' + Math.floor(Math.random()*1000000),
        email: 'debug@test.com',
        password: 'hashedpassword'
      }
    });
    console.log("SUCCESS:", res);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
main();
