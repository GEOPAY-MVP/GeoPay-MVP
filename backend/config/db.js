require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // important for Supabase
});

module.exports = pool;
// This file sets up a connection pool to a PostgreSQL database using the 'pg' library.