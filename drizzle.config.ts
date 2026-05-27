import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle',
	schema: './packages/schemas/src/index.ts',
	dialect: 'sqlite',
	introspect: {
		casing: 'camel',
	},
	dbCredentials: {
		url:
			process.env.DATABASE_URL ||
			`file:${process.env.SQLITE_FILE || './data/iot.sqlite'}`,
	},
});
