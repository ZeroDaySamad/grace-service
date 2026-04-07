import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  const whatsapp = '74846759';
  const password = 'GraceAdmin2024!';
  
  try {
    // Check if admin already exists
    const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existing) {
      console.log('Admin already exists:');
      console.log('  WhatsApp:', existing.whatsapp);
      console.log('  Nom:', existing.nom, existing.prenom);
      console.log('  Role:', existing.role);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        nom: 'Grace Service',
        prenom: 'Admin',
        whatsapp,
        email: 'admin@grace-service.com',
        password: hashedPassword,
        role: 'ADMIN',
        plan_status: 'ACTIVE',
        plan_type: 'PRO',
        plan_expiry: new Date('2099-12-31'),
        ville: 'Ouagadougou'
      }
    });

    console.log('✅ Admin créé avec succès !');
    console.log('  WhatsApp :', whatsapp);
    console.log('  Mot de passe :', password);
    console.log('  ID :', admin.id);
  } catch (err) {
    console.error('Erreur :', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

createAdmin();
