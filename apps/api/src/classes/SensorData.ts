import { db } from '../db';
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
