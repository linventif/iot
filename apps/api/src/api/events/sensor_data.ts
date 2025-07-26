import { SensorData } from '../../classes/SensorData';
import { SensorDataWebSocketType } from '../../schemas/SensorData';
import { WebSocketEvent } from '../../classes/WebSocketEvent';

export default new WebSocketEvent()
	.setType('sensor_data')
	.setOnData(async (wsClient: any, data: SensorDataWebSocketType) => {
		SensorData.fromInput(data).save();
	});
