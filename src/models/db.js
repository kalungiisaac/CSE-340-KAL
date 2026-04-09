import 'dotenv/config';
import { Pool } from "pg";

/**
 * Connection pool for PostgreSQL database.
 *
 * A connection pool maintains a set of reusable database connections
 * to avoid the overhead of creating new connections for each request.
 * This improves performance and reduces load on the database server.
 *
 * Connection configuration can be provided in one of two ways:
 * 1) Set a single connection string via DB_URL
 * 2) Set individual variables (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
 *
 * When running locally, it defaults to a reasonable local Postgres setup.
 */
const connectionString =
  process.env.DB_URL ??
  (() => {
    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || "5432";
    const database = process.env.DB_NAME || "cse340";
    const user = process.env.DB_USER || "postgres";
    const password = process.env.DB_PASSWORD || "postgres";

    // NOTE: encoding the password avoids issues with special characters.
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  })();

// Use SSL by default only in production unless overridden
const useSsl =
  process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

/**
 * Common SSL Issue:
 *
 * You may encounter SSL connection errors depending on your operating system, Node.js
 * version, or PostgreSQL server settings. If you have confirmed your credentials are
 * correct but still see SSL errors, try updating the 'ssl' property in the Pool
 * configuration above to:
 *
 * ssl: {
 *     rejectUnauthorized: false
 * }
 */

/**
 * Since we will modify the normal pool object in development mode, we need to create and
 * export a reference to the pool object. This allows us to use the same name for the
 * export regardless of whether we are in development or production mode.
 */
let db = null;

if (
  process.env.NODE_ENV === "development" &&
  process.env.ENABLE_SQL_LOGGING === "true"
) {
  /**
   * In development mode, we wrap the pool to provide query logging.
   * This helps with debugging by showing all executed queries in the console.
   *
   * The wrapper also adds timing information to help identify slow queries
   * and tracks the number of rows affected by each query.
   */
  db = {
    async query(text, params) {
      try {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log("Executed query:", {
          text: text.replace(/\s+/g, " ").trim(),
          duration: `${duration}ms`,
          rows: res.rowCount,
        });
        return res;
      } catch (error) {
        console.error("Error in query:", {
          text: text.replace(/\s+/g, " ").trim(),
          error: error.message,
        });
        throw error;
      }
    },

    async close() {
      await pool.end();
    },
  };
} else {
  // In production, export the pool directly without logging overhead
  db = pool;
}

/**
 * Tests the database connection by executing a simple query.
 */
const maskConnectionString = (cs) => {
  if (!cs) return "<empty>";
  // Mask password in connection strings like postgresql://user:pass@host:port/db
  return cs.replace(/(:)([^:@]+)(@)/, "$1****$3");
};

const testConnection = async () => {
  try {
    console.log("Attempting DB connect:", {
      connectionString: maskConnectionString(connectionString),
      ssl: useSsl,
    });

    const result = await db.query("SELECT NOW() as current_time");
    console.log("Database connection successful:", result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

export { db as default, testConnection };
