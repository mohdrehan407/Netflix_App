const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('user:password')
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })
    : null;

const initializeDb = async () => {
    const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      uid VARCHAR(50) PRIMARY KEY,
      uname VARCHAR(255) NOT NULL,
      password TEXT NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20)
    );
  `;

    const createWatchlistTableQuery = `
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      movie_id INT NOT NULL,
      movie_data JSONB NOT NULL,
      CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(uid)
        ON DELETE CASCADE,
      UNIQUE (user_id, movie_id)
    );
  `;

    try {
        if (!pool) {
            console.warn("⚠️ Database not configured. Skipping initialization.");
            return;
        }
        const client = await pool.connect();
        await client.query(createUsersTableQuery);
        console.log("✅ Database table 'users' initialized");
        await client.query(createWatchlistTableQuery);
        console.log("✅ Database table 'watchlist' initialized");
        client.release();
    } catch (err) {
        console.error("❌ Error initializing database:", err.message);
    }
};

module.exports = { pool, initializeDb };
