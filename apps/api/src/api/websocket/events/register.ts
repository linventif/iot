import { WebSocketEvent } from '../../../classes/WebSocketEvent';
import { SensorDataWebSocketType } from '../../../schemas/SensorData';

export default new WebSocketEvent()
	.setType('register')
	.setOnData(async (wsClient: any, data: SensorDataWebSocketType) => {
		//
	});
