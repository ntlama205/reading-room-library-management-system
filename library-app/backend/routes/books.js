import { Router } from 'express';
import { pool } from '../db.js';
const router = Router();
const shape = r => ({ id: r.id, title: r.title, author: r.author, genre: r.genre, isbn: r.isbn, qty: r.quantity });


router.put('/sync/all', async (req, res, next) => {
  const rows = req.body.books;
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'books must be an array.' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const b of rows) {
      if (!b.title || !b.author || !b.genre || !/^\\d{10,13}$/.test(String(b.isbn)) || !Number.isInteger(Number(b.qty)) || Number(b.qty) < 0) continue;
      await conn.execute('INSERT INTO books(title,author,genre,isbn,quantity) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),author=VALUES(author),genre=VALUES(genre),quantity=VALUES(quantity)', [b.title,b.author,b.genre,String(b.isbn),Number(b.qty)]);
    }
    if (rows.length) {
      const isbns = rows.map(b => String(b.isbn));
      await conn.query(`DELETE FROM books WHERE isbn NOT IN (${isbns.map(() => '?').join(',')})`, isbns);
    } else {
      await conn.query('DELETE FROM books');
    }
    await conn.commit(); res.json({ ok: true, synced: rows.length });
  } catch (e) { await conn.rollback(); next(e); } finally { conn.release(); }
});


router.put('/isbn/:isbn', async (req, res, next) => {
  try {
    const { title, author, genre, isbn, qty } = req.body;
    if (![title, author, genre, isbn].every(v => typeof v === 'string' && v.trim()) || !/^\\d{10,13}$/.test(String(isbn)) || !Number.isInteger(Number(qty)) || Number(qty) < 0) return res.status(400).json({ error: 'Invalid book details.' });
    const [r] = await pool.execute('UPDATE books SET title=?,author=?,genre=?,isbn=?,quantity=? WHERE isbn=?',[title.trim(),author.trim(),genre.trim(),String(isbn),Number(qty),req.params.isbn]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Book not found.' });
    res.json({ ok: true });
  } catch (e) { if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A book with this ISBN already exists.' }); next(e); }
});
router.delete('/isbn/:isbn', async (req, res, next) => {
  try { const [r] = await pool.execute('DELETE FROM books WHERE isbn=?',[req.params.isbn]); if (!r.affectedRows) return res.status(404).json({ error: 'Book not found.' }); res.status(204).end(); } catch (e) { next(e); }
});

router.get('/', async (_req, res, next) => {
  try { const [rows] = await pool.query('SELECT * FROM books ORDER BY title'); res.json(rows.map(shape)); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { title, author, genre, isbn, qty } = req.body;
    if (![title, author, genre, isbn].every(v => typeof v === 'string' && v.trim()) || !/^\d{10,13}$/.test(String(isbn)) || !Number.isInteger(Number(qty)) || Number(qty) < 0) return res.status(400).json({ error: 'Enter title, author, genre, a 10–13 digit ISBN and a non-negative whole quantity.' });
    const [r] = await pool.execute('INSERT INTO books(title,author,genre,isbn,quantity) VALUES(?,?,?,?,?)',[title.trim(),author.trim(),genre.trim(),String(isbn),Number(qty)]);
    const [rows] = await pool.execute('SELECT * FROM books WHERE id=?',[r.insertId]); res.status(201).json(shape(rows[0]));
  } catch (e) { if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A book with this ISBN already exists.' }); next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const { title, author, genre, isbn, qty } = req.body;
    if (![title, author, genre, isbn].every(v => typeof v === 'string' && v.trim()) || !/^\d{10,13}$/.test(String(isbn)) || !Number.isInteger(Number(qty)) || Number(qty) < 0) return res.status(400).json({ error: 'Invalid book details.' });
    const [r] = await pool.execute('UPDATE books SET title=?,author=?,genre=?,isbn=?,quantity=? WHERE id=?',[title.trim(),author.trim(),genre.trim(),String(isbn),Number(qty),req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Book not found.' });
    const [rows] = await pool.execute('SELECT * FROM books WHERE id=?',[req.params.id]); res.json(shape(rows[0]));
  } catch (e) { if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A book with this ISBN already exists.' }); next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { const [r] = await pool.execute('DELETE FROM books WHERE id=?',[req.params.id]); if (!r.affectedRows) return res.status(404).json({ error: 'Book not found.' }); res.status(204).end(); } catch (e) { next(e); }
});
export default router;
