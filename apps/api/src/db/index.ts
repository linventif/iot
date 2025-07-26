// db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sensor_history } from './schema';

const connection = await mysql.createConnection({
	host: process.env.MYSQL_HOST || 'localhost',
	user: process.env.MYSQL_USER || 'pooluser',
	password: process.env.MYSQL_PASSWORD || 'poolpassword',
	database: process.env.MYSQL_DATABASE || 'auto_pool_pump',
});

export const db = drizzle(connection, {
	schema: {
		sensor_history,
	},
	mode: 'default',
});
