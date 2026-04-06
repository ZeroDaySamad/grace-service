import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./dev.db');

db.all("SELECT id, nom, prenom, whatsapp, role FROM User", [], (err, rows) => {
    if (err) console.error(err.message);
    else console.log('All users:', JSON.stringify(rows, null, 2));
    db.close();
});
