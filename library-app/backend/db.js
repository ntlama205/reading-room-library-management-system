
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Find the folder where this file is saved.
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

// Load environment settings from backend/.env.
dotenv.config({ path: path.join(currentDirectory, '.env') });

// Load the Aiven CA certificate when SSL is enabled.
const ssl = process.env.DB_SSL === 'true'
  ? {
      ca: fs.readFileSync(
        path.join(currentDirectory, 'ca.pem'),
        'utf8'
      )
    }
  : undefined;

// Configure the MySQL connection.
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  ...(ssl ? { ssl } : {})
};

// Connect to the selected database.
export const pool = mysql.createPool({
  ...config,
  database: process.env.DB_NAME || 'reading_room'
});

// Create the required database tables.
export async function initialiseDatabase() {
  // Create the database only when using local MySQL.
  if (!process.env.DB_HOST?.includes('aivencloud.com')) {
    const database = (process.env.DB_NAME || 'reading_room')
      .replace(/[^a-zA-Z0-9_]/g, '');

    const connection = await mysql.createConnection(config);

    try {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\`
         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
    } finally {
      await connection.end();
    }
  }

  // Create the users table.
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    membership_id VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','member') NOT NULL DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create the books table.
  await pool.query(`CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(180) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    quantity INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create the transactions table.
  await pool.query(`CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NULL,
    book_title VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(40) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_book
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
  )`);

  // Create the membership requests table.
  await pool.query(`CREATE TABLE IF NOT EXISTS membership_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    membership_id VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}
