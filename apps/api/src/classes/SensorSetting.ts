import { db } from '../db';
import { sensor_setting, SensorSettingSchema } from '../schemas/SensorSetting';

export class SensorSetting {
	constructor(
		public readonly id: string,
		public readonly setting: string,
		public readonly value: string | number | boolean,
		public readonly type: 'string' | 'number' | 'boolean'
	) {}

	static fromInput(data: unknown): SensorSetting {
		const parsed = SensorSettingSchema.parse(data);
		return new SensorSetting(
			parsed.sensorID,
			parsed.setting,
			parsed.value,
			parsed.type
		);
	}

	static fromDataBase(data: unknown): SensorSetting {
		const parsed = SensorSettingSchema.parse(data);
		return new SensorSetting(
			parsed.sensorID,
			parsed.setting,
			parsed.value,
			parsed.type
		);
	}

	async save(): Promise<SensorSetting> {
		await db.insert(sensor_setting).values({
			sensorID: this.id,
			setting: this.setting,
			value: this.value.toString(),
			type: this.type,
		});
		return this;
	}
}
