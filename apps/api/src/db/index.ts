// db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@schemas/src';

// Use a pool to avoid failing at startup before DB is ready
const pool = mysql.createPool({
	host: process.env.MYSQL_HOST || 'localhost',
	port: Number(process.env.MYSQL_PORT || '3306'),
	user: process.env.MYSQL_USER || 'pooluser',
	password: process.env.MYSQL_PASSWORD || 'poolpassword',
	database: process.env.MYSQL_DATABASE || 'auto_pool_pump',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

export const db = drizzle(pool, {
	schema,
	mode: 'default',
});
