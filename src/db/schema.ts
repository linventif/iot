import {
	mysqlTable,
	varchar,
	decimal,
	timestamp,
	int,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const sensors = mysqlTable('sensors', {
	id: int('id').primaryKey().autoincrement(),
	sensorId: varchar('sensor_id', { length: 255 }).notNull(),
	temperature: decimal('temperature', { precision: 5, scale: 2 }).notNull(),
	unit: varchar('unit', { length: 10 }).notNull().default('celsius'),
	timestamp: timestamp('timestamp')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export type Sensor = typeof sensors.$inferSelect;
export type NewSensor = typeof sensors.$inferInsert;
