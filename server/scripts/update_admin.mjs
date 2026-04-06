import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../prisma/dev.db');

const db = await open({ filename: dbPath, driver: sqlite3.Database });

const users = await db.all("SELECT id, nom, prenom, whatsapp, role FROM User");
console.log('All users:', JSON.stringify(users, null, 2));

// Update admin record
const result = await db.run(
    "UPDATE User SET nom='Grace Service', prenom='Admin', whatsapp='74846759' WHERE role='ADMIN'"
);
console.log('Admin rows updated:', result.changes);

await db.close();
