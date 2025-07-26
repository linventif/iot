import { WebSocketEvent } from '../../../classes/WebSocketEvent';
import { SensorDataWebSocketType } from '@schemas/src/SensorData';

export default new WebSocketEvent()
	.setType('register')
	.setOnData(async (wsClient: any, data: SensorDataWebSocketType) => {
		//
	});
