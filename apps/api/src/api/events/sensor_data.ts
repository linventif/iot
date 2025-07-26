import { SensorData } from '../../classes/SensorData';
import { sensorWebSocketType } from '../../schemas/Sensor';
import { WebSocketEvent } from '../../classes/WebSocketEvent';

export default new WebSocketEvent()
	.setType('sensor_data')
	.setOnData(async (wsClient: any, data: sensorWebSocketType) => {
		SensorData.fromWebSocket(data).save();
	});
