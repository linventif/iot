import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle',
	schema: './packages/schemas/src/index.ts',
	dialect: 'mysql',
	introspect: {
		casing: 'camel',
	},
	dbCredentials: {
		host: process.env.DRIZZLE_HOST || 'localhost',
		port: Number(
			process.env.DRIZZLE_PORT || process.env.MYSQL_PUBLIC_PORT || '3306',
		),
		user: process.env.MYSQL_USER || 'pooluser',
		password: process.env.MYSQL_PASSWORD || 'poolpassword',
		database: process.env.MYSQL_DATABASE || 'auto_pool_pump',
	},
});
