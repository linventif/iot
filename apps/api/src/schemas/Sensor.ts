import { z } from 'zod';

export const sensorSchema = z.object({
	id: z.string(),
	poolTemp: z.number(),
	outTemp: z.number(),
	relayState: z.boolean(),
	forceState: z.enum(['ON', 'OFF', 'AUTO']),
});

export const sensorWebSocketSchema = sensorSchema.extend({
	type: z.literal('sensor_data'),
});

export type sensorWebSocketType = z.infer<typeof sensorWebSocketSchema>;

export const sensorDataBaseSchema = sensorSchema.extend({
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
