import { SensorData } from '../../classes/SensorData';
import { sensorWebSocketType } from '../../schemas/Sensor';
import { WebSocketEvent } from '../../classes/WebSocketEvent';

export default new WebSocketEvent()
	.setType('register')
	.setOnData(async (wsClient: any, data: sensorWebSocketType) => {
		//
	});
