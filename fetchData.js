#!/usr/bin/env node
import 'dotenv/config';
import { getAllTables, fetchTableWithCount, getTableSchema } from './src/models/fetchRenderData.js';
import db from './src/models/db.js';

async function main() {
  try {
    console.log('\n🚀 Starting Render Database Data Fetch...\n');

    // Get all tables
    const tables = await getAllTables();

    if (tables.length === 0) {
      console.log('⚠️  No tables found in the database.');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📦 FETCHING DATA FROM ALL TABLES');
    console.log('='.repeat(60) + '\n');

    // Fetch data from each table
    for (const table of tables) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`📋 Table: ${table.toUpperCase()}`);
      console.log('─'.repeat(60));

      try {
        // Get schema
        const schema = await getTableSchema(table);
        console.log(`\n📌 Schema (${schema.length} columns):`);
        schema.forEach(col => {
          console.log(`   • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
        });

        // Get data with count
        const data = await fetchTableWithCount(table);
        
        console.log(`\n📊 Data (Total: ${data.total} rows):`);
        if (data.rows.length > 0) {
          console.log(JSON.stringify(data.rows, null, 2));
        } else {
          console.log('   (No data in this table)');
        }
      } catch (error) {
        console.error(`⚠️  Could not fetch data from ${table}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Data fetch complete!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
