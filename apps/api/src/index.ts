import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { insertSensorData, getSensorReadings } from '../../../src/db/index';
import 'dotenv/config';

const port = process.env.PORT || 4001;
console.log(`port: ${port}`);

// Track connected clients and their type
const wsClients = new Map<any, { type: string }>();

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

				// Register client type
				if (data.type === 'register' && data.clientType) {
					wsClients.set(ws, { type: data.clientType });
					console.log(`Registered ws client as: ${data.clientType}`);
					return;
				}

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
					// Send to all website clients
					for (const [client, info] of wsClients.entries()) {
						if (info.type === 'website') {
							try {
								client.send(
									JSON.stringify({
										type: 'sensor_data',
										...data,
									})
								);
							} catch (e) {
								console.error(
									'Failed to send to website client:',
									e
								);
							}
						}
					}
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

		async open(ws: any) {
			console.log('WebSocket connection opened');
			wsClients.set(ws, { type: 'unknown' });

			// Send welcome message when client connects
			ws.send({
				type: 'welcome',
				message: 'Hello World! WebSocket connection established.',
				timestamp: new Date().toISOString(),
			});

			// Fetch and send latest sensor data from DB
			try {
				const readings = await getSensorReadings(undefined, 1);
				if (readings[0]) {
					ws.send({
						type: 'sensor_data',
						...readings[0],
					});
				}
			} catch (error) {
				console.error('❌ Error sending latest sensor data:', error);
			}
		},

		close(ws: any) {
			console.log('WebSocket connection closed');
			wsClients.delete(ws);
		},
	})
	// Get latest sensor data
	.get('/api/sensors/latest', async () => {
		try {
			const readings = await getSensorReadings(undefined, 1);
			return {
				success: true,
				data: readings[0] || null,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch sensor data',
				timestamp: new Date().toISOString(),
			};
		}
	})
	// Get sensor history
	.get('/api/sensors/history', async ({ query }) => {
		try {
			const limit = parseInt(query.limit as string) || 100;
			const deviceId = query.deviceId as string;
			const readings = await getSensorReadings(deviceId, limit);
			return {
				success: true,
				data: readings,
				count: readings.length,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				success: false,
				error: 'Failed to fetch sensor history',
				timestamp: new Date().toISOString(),
			};
		}
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
