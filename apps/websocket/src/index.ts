import { WebSocketServer } from 'ws';
import { insertSensorData } from '../../../src/db/index';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
	console.log('New client connected');

	ws.on('message', async (message) => {
		try {
			const data = JSON.parse(message.toString());
			console.log('Received message:', data);

			// Enregistrer les données si c'est un message de capteur
			if (data.type === 'sensor_data') {
				await insertSensorData({
					deviceId: data.deviceId,
					tempPool: data.tempPool,
					tempOutdoor: data.tempOutdoor,
					relayState: data.relayState,
					wifiSignal: data.wifiSignal,
					freeHeap: data.freeHeap,
					uptime: data.uptime,
					deviceTimestamp: data.timestamp,
				});
				console.log('✅ Sensor data saved to database');
			}

			// ...existing code...
		} catch (error) {
			console.error('❌ Error processing message:', error);
		}
	});

	ws.on('close', () => {
		console.log('Client disconnected');
	});
});

console.log('WebSocket server is running on ws://localhost:8080');
