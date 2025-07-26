import { z } from 'zod';

export const SensorDataSchema = z.object({
	id: z.string(),
	poolTemp: z.number(),
	outTemp: z.number(),
	relayState: z.boolean(),
	forceState: z.enum(['ON', 'OFF', 'AUTO']),
});

export const SensorDataWebSocketSchema = SensorDataSchema.extend({
	type: z.literal('sensor_data'),
});

export type SensorDataWebSocketType = z.infer<typeof SensorDataWebSocketSchema>;

export const SensorDataBaseSchema = SensorDataSchema.extend({
	createdAt: z.coerce.date(),
});

export type SensorDataBaseType = z.infer<typeof SensorDataBaseSchema>;

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
