import mysql from 'mysql2/promise';
import 'dotenv/config';

async function resetDatabase() {
	try {
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST || 'localhost',
			port: Number(process.env.DB_PORT) || 3306,
			user: process.env.MYSQL_USER || 'pooluser',
			password: process.env.MYSQL_PASSWORD || 'poolpassword',
			database: process.env.MYSQL_DATABASE || 'auto_pool_pump',
		});

		console.log('🗑️ Dropping existing sensors table...');
		await connection.execute('DROP TABLE IF EXISTS sensors');

		console.log('✅ Table dropped successfully');

		await connection.end();
	} catch (error) {
		console.error('❌ Reset failed:', error);
	}
}

resetDatabase();
