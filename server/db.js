import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'prisma/dev.db');

export async function initDB() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            whatsapp TEXT UNIQUE NOT NULL,
            email TEXT,
            password TEXT NOT NULL,
            ville TEXT,
            role TEXT DEFAULT 'USER',
            plan_status TEXT DEFAULT 'NONE',
            plan_type TEXT,
            plan_expiry TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT NOT NULL,
            category TEXT NOT NULL,
            whatsapp_clicks INTEGER DEFAULT 0,
            sellerId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sellerId) REFERENCES User(id)
        );

        CREATE TABLE IF NOT EXISTS CartItem (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            productId INTEGER,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (userId) REFERENCES User(id),
            FOREIGN KEY (productId) REFERENCES Product(id),
            UNIQUE(userId, productId)
        );

        CREATE TABLE IF NOT EXISTS Category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );
    `);

    // Seed Categories
    const categoriesCount = await db.get('SELECT COUNT(*) as count FROM Category');
    if (categoriesCount.count === 0) {
        const defaultCategories = ["Tout", "Électronique", "Mode", "Maison", "Beauté", "Accessoires", "Autres"];
        for (const cat of defaultCategories) {
            await db.run('INSERT INTO Category (name) VALUES (?)', [cat]);
        }
    }


    // Seed Admin if not exists
    const admin = await db.get('SELECT * FROM User WHERE role = ?', ['ADMIN']);
    if (!admin) {
        const hashedPassword = await bcrypt.hash('@cipherdev26', 10);
        await db.run(
            'INSERT INTO User (nom, prenom, whatsapp, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            ['Admin', 'System', '07572034', 'admin@easymarkey.com', hashedPassword, 'ADMIN']
        );
        console.log('Seeded default admin user: 07572034 / @cipherdev26');
    }

    return db;
}
