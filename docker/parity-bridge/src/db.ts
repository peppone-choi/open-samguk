/**
 * Database Connection for Legacy MariaDB
 */

import mysql from "mysql2/promise";

const DB_CONFIG = {
  host: process.env.LEGACY_DB_HOST || "legacy-db",
  port: parseInt(process.env.LEGACY_DB_PORT || "3306", 10),
  user: process.env.LEGACY_DB_USER || "sammo",
  password: process.env.LEGACY_DB_PASS || "sammo_test_pass",
  database: process.env.LEGACY_DB_NAME || "sammo_game",
  charset: "utf8mb4",
  timezone: "+09:00",
};

/**
 * Create a new database connection
 */
export async function createConnection(): Promise<mysql.Connection> {
  return mysql.createConnection(DB_CONFIG);
}

/**
 * Create a connection pool
 */
export function createPool(): mysql.Pool {
  return mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

/**
 * Execute a query and return results
 */
export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
  const connection = await createConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows as T[];
  } finally {
    await connection.end();
  }
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction<T>(callback: (conn: mysql.Connection) => Promise<T>): Promise<T> {
  const connection = await createConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}
