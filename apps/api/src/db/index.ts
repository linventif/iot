import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@schemas/src';

const sqliteFile = process.env.SQLITE_FILE || './data/iot.sqlite';
const databaseUrl = process.env.DATABASE_URL || `file:${sqliteFile}`;

if (databaseUrl.startsWith('file:')) {
	const filePath = databaseUrl.slice('file:'.length);
	mkdirSync(dirname(filePath), { recursive: true });
}

const client = createClient({
	url: databaseUrl,
});

export const db = drizzle(client, {
	schema,
});

export async function initDatabase() {
	await client.execute(`
		CREATE TABLE IF NOT EXISTS sensor_history (
			id TEXT NOT NULL,
			pool_temp REAL NOT NULL,
			out_temp REAL NOT NULL,
			relay_state INTEGER NOT NULL,
			force_state TEXT NOT NULL,
			created_at INTEGER NOT NULL
		)
	`);

	await client.execute(`
		CREATE INDEX IF NOT EXISTS sensor_history_created_at_idx
		ON sensor_history (created_at)
	`);

	await client.execute(`
		CREATE TABLE IF NOT EXISTS sensor_setting (
			sensor_id TEXT NOT NULL,
			setting TEXT NOT NULL,
			value TEXT NOT NULL,
			type TEXT NOT NULL
		)
	`);
}
