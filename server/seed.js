import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'prisma/dev.db');

async function seed() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    console.log('Seeding database...');

    // 1. Create a test user (PRO & ACTIVE)
    const password = await bcrypt.hash('password123', 10);
    try {
        await db.run(`
            INSERT OR IGNORE INTO User (nom, prenom, whatsapp, email, password, role, plan_status, ville)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['Koné', 'Abdoulaye', '+22670000000', 'abdoulaye@example.com', password, 'PRO', 'ACTIVE', 'Ouagadougou']);
        
        const user = await db.get('SELECT id FROM User WHERE whatsapp = ?', ['+22670000000']);
        const sellerId = user.id;

        // 2. Add some products
        const products = [
            {
                name: 'iPhone 15 Pro Max',
                description: 'Dernier iPhone avec processeur A17 Pro. Neuf sous carton.',
                price: 950000,
                category: 'Électronique',
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop'
            },
            {
                name: 'Sneakers Nike Air Max',
                description: 'Style moderne et confort absolu pour vos sorties.',
                price: 45000,
                category: 'Mode',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'
            },
            {
                name: 'MacBook Pro M3',
                description: 'Puissance incroyable pour les professionnels du design.',
                price: 1550000,
                category: 'Électronique',
                image: 'https://images.unsplash.com/photo-1517336714460-457319760775?q=80&w=800&auto=format&fit=crop'
            },
            {
                name: 'Machine à café Nespresso',
                description: 'Le café parfait chaque matin en un clic.',
                price: 85000,
                category: 'Maison',
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop'
            },
            {
                name: 'Montre Seiko 5 Sports',
                description: 'Automatique, robuste et élégante.',
                price: 185000,
                category: 'Mode',
                image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop'
            },
            {
                name: 'Casque Sony WH-1000XM5',
                description: 'Meilleure réduction de bruit du marché.',
                price: 245000,
                category: 'Électronique',
                image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop'
            }
        ];

        for (const p of products) {
            await db.run(`
                INSERT INTO Product (name, description, price, image, category, sellerId)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [p.name, p.description, p.price, p.image, p.category, sellerId]);
        }

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await db.close();
    }
}

seed();
