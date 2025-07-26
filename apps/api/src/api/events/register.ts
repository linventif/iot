import { SensorData } from '../../classes/SensorData';
import { sensorDataWebSocketType } from '../../schemas/SensorData';
import { WebSocketEvent } from '../../classes/WebSocketEvent';

export default new WebSocketEvent()
	.setType('register')
	.setOnData(async (wsClient: any, data: sensorDataWebSocketType) => {
		//
	});
