import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sensors, type NewSensor } from './schema';

const client = createClient({
	url: process.env.DATABASE_URL || 'file:./database.db',
});

export const db = drizzle(client);

export const insertSensorReading = async (
	data: Omit<NewSensor, 'id' | 'timestamp' | 'createdAt'>
) => {
	return await db.insert(sensors).values(data).returning();
};

export const getSensorReadings = async (sensorId?: string, limit = 100) => {
	if (sensorId) {
		return await db
			.select()
			.from(sensors)
			.where(eq(sensors.sensorId, sensorId))
			.orderBy(desc(sensors.timestamp))
			.limit(limit);
	}
	return await db
		.select()
		.from(sensors)
		.orderBy(desc(sensors.timestamp))
		.limit(limit);
};

export { sensors };
