import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sensors, sensorSettings, type NewSensor, type NewSensorSetting } from './schema';
import { eq, desc, sql } from 'drizzle-orm';

const connection = await mysql.createConnection({
	host: process.env.DB_HOST || 'localhost',
	port: Number(process.env.DB_PORT) || 3306,
	user: process.env.MYSQL_USER || 'pooluser',
	password: process.env.MYSQL_PASSWORD || 'poolpassword',
	database: process.env.MYSQL_DATABASE || 'auto_pool_pump',
});

export const db = drizzle(connection);

export const insertSensorData = async (data: NewSensor) => {
	return await db.insert(sensors).values(data);
};

export const getSensorReadings = async (deviceId?: string, limit = 100) => {
	if (deviceId) {
		return await db
			.select()
			.from(sensors)
			.where(eq(sensors.deviceId, deviceId))
			.orderBy(desc(sensors.createdAt))
			.limit(limit);
	}
	return await db
		.select()
		.from(sensors)
		.orderBy(desc(sensors.createdAt))
		.limit(limit);
};

export const getSensorSettings = async (deviceId: string) => {
	return await db
		.select()
		.from(sensorSettings)
		.where(eq(sensorSettings.deviceId, deviceId));
};

export const upsertSensorSetting = async (data: Omit<NewSensorSetting, 'id' | 'updatedAt'>) => {
	// Upsert by deviceId + setting
	return await db
		.insert(sensorSettings)
		.values(data)
		.onDuplicateKeyUpdate({
			setting: data.setting,
			value: data.value,
			type: data.type,
			updatedAt: sql`CURRENT_TIMESTAMP`,
		});
};

export { sensors };
