import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Build connection string from environment
let connectionString;

if (process.env.DATABASE_URL) {
  // Use full DATABASE_URL (Railway, Render, etc.)
  connectionString = process.env.DATABASE_URL;
} else {
  // Build from individual connection parameters
  connectionString = `postgresql://${process.env.DB_USER || 'postgres'}:${
    process.env.DB_PASSWORD || 'postgres'
  }@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${
    process.env.DB_NAME || 'api_hub_db'
  }`;
}

const pool = new Pool({
  connectionString,
  // SSL configuration for production (Railway/Render)
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  // Connection pooling settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('✅ Database connection established');
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

export default pool;
