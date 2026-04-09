import 'dotenv/config';
import db from './db.js';

async function runMigration() {
    try {
        console.log('Running migration: Adding username column to users table...');
        
        // Add username column if it doesn't exist
        await db.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS username VARCHAR(100) NOT NULL UNIQUE;
        `);
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

runMigration();
