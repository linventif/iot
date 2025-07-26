import { SensorData } from '../../../classes/SensorData';
import { SensorDataWebSocketType } from '@schemas/src/SensorData';
import { WebSocketEvent } from '../../../classes/WebSocketEvent';
import { ElysiaWS } from 'elysia/dist/ws';

export default new WebSocketEvent()
	.setType('sensor_data')
	.setOnData(async (wsClient: ElysiaWS, data: SensorDataWebSocketType) => {
		SensorData.fromInput(data).save();
	});
