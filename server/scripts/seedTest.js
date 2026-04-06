import { initDB } from '../db.js';

async function seed() {
    const db = await initDB();
    const now = new Date();
    let expiry = new Date();
    expiry.setMonth(now.getMonth() + 1);

    await db.run(
        "INSERT INTO User (nom, prenom, whatsapp, email, password, role, plan_status, plan_type, plan_expiry, ville) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['Test', 'Vendor', '01020304', 'test@vendor.com', 'pwd_hash', 'PRO', 'ACTIVE', 'MENSUEL', expiry.toISOString(), 'Ouagadougou']
    );

    const vendor = await db.get("SELECT last_insert_rowid() as id");
    const vendorId = vendor.id;

    await db.run(
        "INSERT INTO Product (name, description, price, image, category, sellerId, ville) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ['Test Phone', 'Un téléphone de test pour vérification', 150000, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop', 'Électronique', vendorId, 'Ouagadougou']
    );

    console.log('Seeded test vendor (ID:', vendorId, ') and product.');
    await db.close();
}

seed();
