import db from './db.js';

/**
 * Fetch data from Render PostgreSQL database
 * @param {string} tableName - Name of the table to query
 * @param {object} options - Query options
 * @param {number} options.limit - Limit number of rows (default: no limit)
 * @param {string} options.orderBy - Column to order by
 * @param {string} options.where - WHERE clause conditions
 * @returns {Promise<Array>} Array of rows from the database
 */
export const fetchTableData = async (tableName, options = {}) => {
  try {
    let query = `SELECT * FROM ${tableName}`;
    const params = [];

    // Add WHERE clause if provided
    if (options.where) {
      query += ` WHERE ${options.where}`;
    }

    // Add ORDER BY if provided
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }

    // Add LIMIT if provided
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }

    console.log(`📊 Fetching data from table: ${tableName}`);
    const result = await db.query(query, params);
    
    console.log(`✅ Retrieved ${result.rowCount} rows from ${tableName}`);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error fetching data from ${tableName}:`, error.message);
    throw error;
  }
};

/**
 * Fetch all tables from the database
 * @returns {Promise<Array>} Array of table names
 */
export const getAllTables = async () => {
  try {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('📋 Fetching all tables...');
    const result = await db.query(query);
    const tables = result.rows.map(row => row.table_name);
    
    console.log(`✅ Found ${tables.length} tables:`, tables);
    return tables;
  } catch (error) {
    console.error('❌ Error fetching tables:', error.message);
    throw error;
  }
};

/**
 * Get table schema/columns
 * @param {string} tableName - Name of the table
 * @returns {Promise<Array>} Array of column information
 */
export const getTableSchema = async (tableName) => {
  try {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `;
    
    console.log(`🔍 Fetching schema for table: ${tableName}`);
    const result = await db.query(query, [tableName]);
    
    console.log(`✅ Schema retrieved (${result.rowCount} columns)`);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error fetching schema for ${tableName}:`, error.message);
    throw error;
  }
};

/**
 * Execute custom query
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<object>} Query result
 */
export const executeQuery = async (query, params = []) => {
  try {
    console.log('🔄 Executing custom query...');
    const result = await db.query(query, params);
    
    console.log(`✅ Query executed. Rows affected: ${result.rowCount}`);
    return result;
  } catch (error) {
    console.error('❌ Error executing query:', error.message);
    throw error;
  }
};

/**
 * Fetch table with count
 * @param {string} tableName - Name of the table
 * @returns {Promise<object>} Table data with row count
 */
export const fetchTableWithCount = async (tableName) => {
  try {
    const [countResult, dataResult] = await Promise.all([
      db.query(`SELECT COUNT(*) as total FROM ${tableName}`),
      db.query(`SELECT * FROM ${tableName}`),
    ]);

    return {
      tableName,
      total: parseInt(countResult.rows[0].total),
      rows: dataResult.rows,
      rowCount: dataResult.rowCount,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${tableName} with count:`, error.message);
    throw error;
  }
};

export default {
  fetchTableData,
  getAllTables,
  getTableSchema,
  executeQuery,
  fetchTableWithCount,
};
