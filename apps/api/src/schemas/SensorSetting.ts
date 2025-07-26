import { z } from 'zod';

export const SensorSettingSchema = z.object({
	sensorID: z.string(),
	setting: z.string(),
	value: z.union([z.string(), z.number(), z.boolean()]),
	type: z.enum(['string', 'number', 'boolean']),
});

export type SensorSettingType = z.infer<typeof SensorSettingSchema>;

import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const sensor_setting = mysqlTable('sensor_setting', {
	sensorID: varchar('sensor_id', { length: 255 }).notNull(),
	setting: varchar('setting', { length: 255 }).notNull(),
	value: varchar('value', { length: 255 }).notNull(),
	type: varchar('type', { length: 255 }).notNull(),
});
