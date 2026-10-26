import bcrypt from 'bcryptjs';
import { pool } from './db.js';
const passwordHash = await bcrypt.hash('NTLAMA', 10);
await pool.execute("INSERT INTO users(name,membership_id,password_hash,role) VALUES('Admin','901020581',?,'admin') ON DUPLICATE KEY UPDATE name=VALUES(name)",[passwordHash]);
const [rows] = await pool.query('SELECT COUNT(*) AS total FROM books');
if (rows[0].total === 0) {
  await pool.query("INSERT INTO books(title,author,genre,isbn,quantity) VALUES ('To Kill a Mockingbird','Harper Lee','Fiction','9780061120084',4),('1984','George Orwell','Dystopian','9780451524935',1),('The Great Gatsby','F. Scott Fitzgerald','Classic','9780743273565',3)");
}
console.log('Seed complete. Admin membership ID: 901020581');
await pool.end();
