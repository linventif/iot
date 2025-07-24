import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sensors, type NewSensor } from './schema';
import { eq, desc } from 'drizzle-orm';

const connection = await mysql.createConnection({
	host: process.env.DB_HOST || 'localhost',
	port: Number(process.env.DB_PORT) || 3306,
	user: process.env.MYSQL_USER || 'pooluser',
	password: process.env.MYSQL_PASSWORD || 'poolpassword',
	database: process.env.MYSQL_DATABASE || 'auto_pool_pump',
});

export const db = drizzle(connection);

export const insertSensorData = async (data: {
	deviceId: string;
	tempPool: number;
	tempOutdoor: number;
	relayState: boolean;
	wifiSignal: number;
	freeHeap: number;
	uptime: number;
	deviceTimestamp: number;
}) => {
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

export { sensors };
