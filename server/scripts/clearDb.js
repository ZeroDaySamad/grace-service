import { initDB } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function clearDatabase() {
    console.log('Cleaning up database and example data...');
    const db = await initDB();

    try {
        // Clear Products and Cart Items
        console.log('Clearing Products and CartItems...');
        await db.run('DELETE FROM CartItem');
        await db.run('DELETE FROM Product');
        
        // Clear non-admin users
        console.log('Clearing non-admin users...');
        await db.run('DELETE FROM User WHERE role != ?', ['ADMIN']);

        // Reset autoincrement
        await db.run("DELETE FROM sqlite_sequence WHERE name='Product'");
        await db.run("DELETE FROM sqlite_sequence WHERE name='CartItem'");
        await db.run("DELETE FROM sqlite_sequence WHERE name='User'");

        console.log('Database tables cleared (Admin preserved).');

        // Clear uploads folder
        const uploadsDir = path.resolve(__dirname, '../public/uploads');
        if (fs.existsSync(uploadsDir)) {
            console.log('Clearing uploads directory...');
            const files = fs.readdirSync(uploadsDir);
            for (const file of files) {
                // Keep .gitkeep if it exists, otherwise delete all
                if (file !== '.gitkeep') {
                    fs.unlinkSync(path.join(uploadsDir, file));
                }
            }
            console.log('Uploads directory cleared.');
        }

        console.log('Production cleanup completed successfully.');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await db.close();
    }
}

clearDatabase();
