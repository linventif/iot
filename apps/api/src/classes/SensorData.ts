import { db } from '../db';
import { and, desc, gte, lte, type SQL } from 'drizzle-orm';
import {
	sensor_history,
	SensorDataBaseSchema,
	SensorDataWebSocketSchema,
} from '@schemas/src/SensorData';

export class SensorData {
	constructor(
		public readonly id: string,
		public readonly poolTemp: number,
		public readonly outTemp: number,
		public readonly relayState: boolean,
		public readonly forceState: 'ON' | 'OFF' | 'AUTO',
		public readonly createdAt: Date
	) {}

	static fromInput(data: unknown): SensorData {
		const parsed = SensorDataWebSocketSchema.parse(data);
		return new SensorData(
			parsed.id,
			parsed.poolTemp,
			parsed.outTemp,
			parsed.relayState,
			parsed.forceState,
			new Date()
		);
	}

	static fromDataBase(data: unknown): SensorData {
		const parsed = SensorDataBaseSchema.parse(data);
		return new SensorData(
			parsed.id,
			parsed.poolTemp,
			parsed.outTemp,
			parsed.relayState,
			parsed.forceState,
			parsed.createdAt
		);
	}

	async save(): Promise<SensorData> {
		await db.insert(sensor_history).values({
			id: this.id,
			poolTemp: this.poolTemp,
			outTemp: this.outTemp,
			relayState: this.relayState,
			forceState: this.forceState,
			createdAt: this.createdAt,
		});
		return this;
	}
}

export async function getLatestSensorData() {
	return await db.query.sensor_history.findFirst({
		orderBy: (table, { desc }) => desc(table.createdAt),
	});
}

export async function getSensorDataHistory(options: {
	limit?: number;
	from?: Date;
	to?: Date;
} = {}) {
	const conditions: SQL[] = [];

	if (options.from) {
		conditions.push(gte(sensor_history.createdAt, options.from));
	}

	if (options.to) {
		conditions.push(lte(sensor_history.createdAt, options.to));
	}

	return await db.query.sensor_history.findMany({
		orderBy: desc(sensor_history.createdAt),
		...(conditions.length ? { where: and(...conditions) } : {}),
		...(options.limit ? { limit: options.limit } : {}),
	});
}
