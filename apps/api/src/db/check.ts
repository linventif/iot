import mysql from 'mysql2/promise';
import 'dotenv/config';

async function checkDatabase() {
	try {
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST || 'localhost',
			port: Number(process.env.DB_PORT) || 3306,
			user: process.env.MYSQL_USER || 'pooluser',
			password: process.env.MYSQL_PASSWORD || 'poolpassword',
			database: process.env.MYSQL_DATABASE || 'auto_pool_pump',
		});

		console.log('✅ Database connection successful');

		const [tables] = await connection.execute('SHOW TABLES');
		console.log('📋 Tables in database:', tables);

		if (Array.isArray(tables) && tables.length > 0) {
			const [columns] = await connection.execute('DESCRIBE sensors');
			console.log('🏗️ Sensors table structure:', columns);
		}

		await connection.end();
	} catch (error) {
		console.error('❌ Database connection failed:', error);
	}
}

checkDatabase();
