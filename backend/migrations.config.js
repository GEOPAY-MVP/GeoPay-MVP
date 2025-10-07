require('dotenv').config();

module.exports = {
  // Connection to your Supabase DB
  databaseUrl: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  migrationsTable: 'pgmigrations',    // where migration history is tracked
  dir: 'migrations',                  // folder for migration files
  direction: 'up',                    // default direction
};
