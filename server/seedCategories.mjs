import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const categories = [
    { name: 'Ordinateurs' },
    { name: 'Kit' },
    { name: 'Électronique' },
    { name: 'Vêtements' },
    { name: 'Automobile' },
    { name: 'Immobilier' },
    { name: 'Alimentation' },
    { name: 'Services' },
    { name: 'Autres' }
  ];

  try {
    for (const cat of categories) {
      // Upsert to avoid "unique constraint" errors if some already exist
      await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: { name: cat.name }
      });
      console.log(`Catégorie ajoutée / vérifiée : ${cat.name}`);
    }
    console.log("Les catégories ont été injectées avec succès dans la base de données !");
  } catch (error) {
    console.error("Erreur lors de l'injection :", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seed();
