import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initialiseDatabase } from './db.js';
import booksRouter from './routes/books.js';
import transactionsRouter from './routes/transactions.js';
import usersRouter from './routes/users.js';
import requestsRouter from './routes/requests.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); }
  catch (error) { res.status(500).json({ status: 'error', message: 'Database connection failed' }); }
});
app.use('/api/books', booksRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/requests', requestsRouter);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});
const port = Number(process.env.PORT || 5000);
initialiseDatabase().then(() => {
  app.listen(port, () => console.log(`Reading Room API listening on http://localhost:${port}`));
}).catch((error) => {
  console.error('Could not initialise MySQL. Check backend/.env and ensure MySQL is running.', error.message);
  process.exit(1);
});
