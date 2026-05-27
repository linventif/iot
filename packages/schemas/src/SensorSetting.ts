import { z } from 'zod';

export const SensorSettingSchema = z.object({
	sensorID: z.string(),
	setting: z.string(),
	value: z.union([z.string(), z.number(), z.boolean()]),
	type: z.enum(['string', 'number', 'boolean']),
});

export type SensorSettingType = z.infer<typeof SensorSettingSchema>;

import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sensor_setting = sqliteTable('sensor_setting', {
	sensorID: text('sensor_id').notNull(),
	setting: text('setting').notNull(),
	value: text('value').notNull(),
	type: text('type').notNull(),
});
