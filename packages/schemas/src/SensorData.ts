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
	sqliteTable,
	text,
	real,
	integer,
} from 'drizzle-orm/sqlite-core';

export const sensor_history = sqliteTable('sensor_history', {
	id: text('id').notNull(),
	poolTemp: real('pool_temp').notNull(),
	outTemp: real('out_temp').notNull(),
	relayState: integer('relay_state', { mode: 'boolean' }).notNull(),
	forceState: text('force_state').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
