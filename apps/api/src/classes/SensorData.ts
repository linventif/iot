import sensor_data from '../api/events/sensor_data';
import { db } from '../db';
import {
	sensor_history,
	sensorDataBaseSchema,
	sensorDataWebSocketSchema,
} from '../schemas/SensorData';

export class SensorData {
	constructor(
		public readonly id: string,
		public readonly poolTemp: number,
		public readonly outTemp: number,
		public readonly relayState: boolean,
		public readonly forceState: 'ON' | 'OFF' | 'AUTO',
		public readonly createdAt: Date
	) {}

	static fromWebSocket(data: unknown): SensorData {
		console.log('Parsing sensor data from WebSocket:', data);
		const parsed = sensorDataWebSocketSchema.parse(data);
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
		const parsed = sensorDataBaseSchema.parse(data);
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
