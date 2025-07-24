import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { insertSensorData } from '../../../src/db/index';
import 'dotenv/config';

const port = process.env.PORT || 4001;
console.log(`port: ${port}`);

new Elysia()
	.use(
		cors({
			origin: true, // Allow all origins for development
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
		})
	)
	// REST API Hello World endpoint
	.get('/api/hello', () => {
		return {
			message: 'Hello World from REST API!',
			timestamp: new Date().toISOString(),
			status: 'success',
		};
	})
	// WebSocket Hello World endpoint
	.ws('/api/ws', {
		async message(ws: any, message: any) {
			console.log('Received message:', message);

			try {
				const data =
					typeof message === 'string' ? JSON.parse(message) : message;

				// Save sensor data to database
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
			} catch (error) {
				console.error('❌ Error processing sensor data:', error);
			}

			// Send hello world response back to client
			ws.send({
				type: 'hello_response',
				message: 'Hello World from WebSocket!',
				originalMessage: message,
				timestamp: new Date().toISOString(),
			});
		},

		open(ws: any) {
			console.log('WebSocket connection opened');

			// Send welcome message when client connects
			ws.send({
				type: 'welcome',
				message: 'Hello World! WebSocket connection established.',
				timestamp: new Date().toISOString(),
			});
		},

		close(ws: any) {
			console.log('WebSocket connection closed');
		},
	})
	// Health check endpoint
	.get('/api/health', () => {
		return {
			status: 'healthy',
			timestamp: new Date().toISOString(),
		};
	})
	// Root endpoint (the /api is bc of cloudflare)
	.get('/api/', () => {
		return {
			message: 'Auto Pool Pump API Server',
			endpoints: {
				rest: '/api/hello',
				websocket: '/api/ws',
				health: '/api/health',
			},
		};
	})
	.listen(port, () => {
		console.log(
			`🚀 Elysia API server is running on http://localhost:${port}`
		);
		console.log(`📡 REST API: http://localhost:${port}/api/hello`);
		console.log(`🔌 WebSocket: ws://localhost:${port}/api/ws`);
		console.log(`🩺 Health Check: http://localhost:${port}/api/health`);
		console.log(`📋 API Info: http://localhost:${port}/api/`);
	});
