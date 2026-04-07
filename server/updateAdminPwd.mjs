import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateAdminPassword() {
  const newPassword = 'HermanAdmin2026!';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { password: hashedPassword }
  });

  console.log(`✅ Mot de passe mis à jour pour ${result.count} admin(s).`);
  console.log('  Nouveau mot de passe : HermanAdmin2026!');
  await prisma.$disconnect();
  process.exit(0);
}

updateAdminPassword().catch(console.error);
