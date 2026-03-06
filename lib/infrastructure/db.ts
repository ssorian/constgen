import mysql from 'mysql2/promise';

/**
 * Infrastructure: MySQL connection pool.
 * All domain repositories use this pool — never import mysql2 directly in the action layer.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT ?? 3306),
    waitForConnections: true,
    connectionLimit: 10,
});

export default pool;
