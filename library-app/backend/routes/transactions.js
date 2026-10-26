import { Router } from 'express';
import { pool } from '../db.js';
const router = Router();
const shape = r => ({ id: r.id, date: r.created_at, title: r.book_title, type: r.transaction_type, qty: r.quantity });

router.post('/sync/all', async (req,res,next) => {
  const rows = req.body.transactions;
  if (!Array.isArray(rows)) return res.status(400).json({error:'transactions must be an array.'});
  try {
    // The browser uses local IDs only; this endpoint is intentionally read-only for existing history.
    // New transactions should be created through POST /api/transactions so stock is adjusted atomically.
    res.json({ok:true, received:rows.length, note:'Use POST /api/transactions to create durable transaction records.'});
  } catch(e){next(e);}
});

router.get('/', async (_req,res,next) => { try { const [rows] = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC'); res.json(rows.map(shape)); } catch(e){next(e);} });
router.post('/', async (req,res,next) => {
  const { isbn, type, qty } = req.body;
  const amount = Number(qty);
  if (!/^\d{10,13}$/.test(String(isbn)) || !['add','deduct'].includes(type) || !Number.isInteger(amount) || amount < 1) return res.status(400).json({error:'Choose a book, transaction type, and a positive whole quantity.'});
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [books] = await conn.execute('SELECT * FROM books WHERE isbn=? FOR UPDATE',[String(isbn)]);
    if (!books.length) { await conn.rollback(); return res.status(404).json({error:'Book not found.'}); }
    const book = books[0];
    if (type === 'deduct' && book.quantity < amount) { await conn.rollback(); return res.status(400).json({error:`Insufficient stock. Only ${book.quantity} available.`}); }
    const next = book.quantity + (type === 'add' ? amount : -amount);
    await conn.execute('UPDATE books SET quantity=? WHERE id=?',[next,book.id]);
    const label = type === 'add' ? 'Stock Added' : 'Borrowed / Deducted';
    const [r] = await conn.execute('INSERT INTO transactions(book_id,book_title,transaction_type,quantity) VALUES(?,?,?,?)',[book.id,book.title,label,amount]);
    await conn.commit();
    res.status(201).json({id:r.insertId,title:book.title,type:label,qty:amount,date:new Date().toISOString(),remaining:next});
  } catch(e) { await conn.rollback(); next(e); } finally { conn.release(); }
});
export default router;
