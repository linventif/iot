import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle',
	schema: './packages/schemas/src/index.ts',
	dialect: 'mysql',
	introspect: {
		casing: 'camel',
	},
	dbCredentials: {
		host: 'localhost',
		port: 3306,
		user: process.env.MYSQL_USER || 'pooluser',
		password: process.env.MYSQL_PASSWORD || 'poolpassword',
		database: process.env.MYSQL_DATABASE || 'auto_pool_pump',
	},
});
