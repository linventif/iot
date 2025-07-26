import { z } from 'zod';

export const sensorDataSchema = z.object({
	id: z.string(),
	poolTemp: z.number(),
	outTemp: z.number(),
	relayState: z.boolean(),
	forceState: z.enum(['ON', 'OFF', 'AUTO']),
});

export const sensorDataWebSocketSchema = sensorDataSchema.extend({
	type: z.literal('sensor_data'),
});

export type sensorDataWebSocketType = z.infer<typeof sensorDataWebSocketSchema>;

export const sensorDataBaseSchema = sensorDataSchema.extend({
	createdAt: z.coerce.date(),
});

export type sensorDataBaseType = z.infer<typeof sensorDataBaseSchema>;

import {
	mysqlTable,
	varchar,
	double,
	boolean,
	timestamp,
} from 'drizzle-orm/mysql-core';

export const sensor_history = mysqlTable('sensor_history', {
	id: varchar('id', { length: 255 }).notNull(),
	poolTemp: double('pool_temp').notNull(),
	outTemp: double('out_temp').notNull(),
	relayState: boolean('relay_state').notNull(),
	forceState: varchar('force_state', { length: 10 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});
