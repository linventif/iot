import {
	mysqlTable,
	varchar,
	decimal,
	timestamp,
	int,
	boolean,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const sensors = mysqlTable('sensors', {
	id: int('id').primaryKey().autoincrement(),
	deviceId: varchar('device_id', { length: 255 }).notNull(),
	tempPool: decimal('temp_pool', { precision: 6, scale: 4 }).notNull(),
	tempOutdoor: decimal('temp_outdoor', { precision: 6, scale: 4 }).notNull(),
	relayState: boolean('relay_state').notNull(),
	wifiSignal: int('wifi_signal').notNull(),
	freeHeap: int('free_heap').notNull(),
	uptime: int('uptime').notNull(),
	deviceTimestamp: int('device_timestamp').notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export type Sensor = typeof sensors.$inferSelect;
export type NewSensor = typeof sensors.$inferInsert;
