import { SensorData } from '../../classes/SensorData';
import { sensorDataWebSocketType } from '../../schemas/SensorData';
import { WebSocketEvent } from '../../classes/WebSocketEvent';

export default new WebSocketEvent()
	.setType('sensor_data')
	.setOnData(async (wsClient: any, data: sensorDataWebSocketType) => {
		SensorData.fromWebSocket(data).save();
	});
