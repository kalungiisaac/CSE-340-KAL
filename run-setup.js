import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import db from './src/models/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSetup() {
    try {
        const sqlPath = path.join(__dirname, 'src/models/setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running setup.sql...');
        // Split by semicolon to run individual commands if needed, 
        // but pg.query can often handle multiple statements.
        await db.query(sql);
        console.log('Database setup completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running setup:', error);
        process.exit(1);
    }
}

runSetup();
