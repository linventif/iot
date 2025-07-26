import { SensorData } from '../../classes/SensorData';
import { SensorDataWebSocketType } from '../../schemas/SensorData';
import { WebSocketEvent } from '../../classes/WebSocketEvent';

export default new WebSocketEvent()
	.setType('register')
	.setOnData(async (wsClient: any, data: SensorDataWebSocketType) => {
		//
	});
