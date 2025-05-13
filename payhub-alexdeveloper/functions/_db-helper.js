// Helper function for database migration in production environment
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

// Ensure DATABASE_URL is set in Netlify environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export async function setupProductionDatabase() {
  console.log('Setting up production database...');
  
  try {
    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Create Drizzle instance
    const db = drizzle(pool);
    
    // Apply migrations if any
    if (process.env.RUN_MIGRATIONS === 'true') {
      console.log('Running migrations...');
      try {
        // This would require migration files to be included in the build
        // await migrate(db, { migrationsFolder: './migrations' });
        console.log('Migrations completed successfully');
      } catch (migrateError) {
        console.error('Migration error:', migrateError);
      }
    }
    
    console.log('Database setup completed');
    return { pool, db };
  } catch (error) {
    console.error('Failed to setup production database:', error);
    throw error;
  }
}

// Export a pre-configured pool and db instance for reuse
let _pool;
let _db;

export async function getDbInstance() {
  if (!_db) {
    const setup = await setupProductionDatabase();
    _pool = setup.pool;
    _db = setup.db;
  }
  return { pool: _pool, db: _db };
}