import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import 'dotenv/config';

const port = Number(process.env.PORT || 4001);

type ClientType = 'device' | 'website' | 'unknown';
interface WSClientInfo {
	type: ClientType;
	deviceId?: string;
}
const wsClients = new Map<any, WSClientInfo>();

new Elysia()
	.use(
		cors({
			origin: true,
			methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
		})
	)
	// Simple REST hello
	.get('/api/hello', () => ({
		message: 'Hello World from REST API!',
		timestamp: new Date().toISOString(),
		status: 'success',
	}))
	// WebSocket endpoint
	.ws('/api/ws', {
		async open(ws) {
			console.log('[WS] Connection opened');
			wsClients.set(ws, { type: 'unknown' });
			ws.send(
				JSON.stringify({
					type: 'welcome',
					message: 'WebSocket connection established.',
					timestamp: new Date().toISOString(),
				})
			);
		},

		async message(ws, raw) {
			let data: any;
			try {
				data = typeof raw === 'string' ? JSON.parse(raw) : raw;
			} catch {
				console.error('[WS] Invalid JSON');
				ws.send(
					JSON.stringify({ type: 'error', error: 'Invalid JSON' })
				);
				return;
			}

			// 1) Register clients (device or website)
			if (data.type === 'register' && data.clientType) {
				const info: WSClientInfo = {
					type: data.clientType,
					deviceId: data.deviceId,
				};
				wsClients.set(ws, info);
				console.log(
					`[WS] Registered ${data.clientType} (${
						data.deviceId || '–'
					})`
				);

				// If it's a device, send it its current config
				if (info.type === 'device' && info.deviceId) {
					console.log(
						`[WS] Sending current config to device ${info.deviceId}`
					);
					// const rows = await getSensorSettings(info.deviceId);
					// const cfg = Object.fromEntries(
					// 	rows.map((r) => [r.setting, r.value])
					// );
					// ws.send(
					// 	JSON.stringify({
					// 		type: 'current_config',
					// 		deviceId: info.deviceId,
					// 		...cfg,
					// 	})
					// );
				}
				return;
			}

			// 2) Incoming sensor_data
			if (data.type === 'sensor_data') {
				const {
					deviceId,
					poolTemp,
					outTemp,
					relayState,
					wifiSignal,
					freeHeap,
					uptime,
					timestamp: deviceTimestamp,
				} = data;

				// await insertSensorData({
				// 	deviceId,
				// 	tempPool: poolTemp,
				// 	tempOutdoor: outTemp,
				// 	relayState,
				// 	wifiSignal,
				// 	freeHeap,
				// 	uptime,
				// 	deviceTimestamp,
				// });
				console.log('[WS] Saved sensor_data for', deviceId);

				// Broadcast to all website clients
				for (const [client, info] of wsClients.entries()) {
					if (info.type === 'website') {
						client.send(
							JSON.stringify({ type: 'sensor_data', ...data })
						);
					}
				}
				return;
			}

			// 3) Incoming update_config
			if (data.type === 'update_config') {
				const { deviceId, tempThreshold } = data;
				// await upsertSensorSetting({
				// 	deviceId,
				// 	setting: 'tempThreshold',
				// 	value: String(tempThreshold),
				// 	type: 'float',
				// });
				console.log(
					'[WS] Updated tempThreshold for',
					deviceId,
					'=',
					tempThreshold
				);
				return;
			}

			// 4) Incoming force_relay
			if (data.type === 'force_relay') {
				const { deviceId, forceState } = data;
				// await upsertSensorSetting({
				// 	deviceId,
				// 	setting: 'forceState',
				// 	value: forceState,
				// 	type: 'string',
				// });
				console.log(
					'[WS] Updated forceState for',
					deviceId,
					'=',
					forceState
				);
				return;
			}

			// 5) Unknown type
			ws.send(
				JSON.stringify({ type: 'error', error: 'Unknown message type' })
			);
		},

		close(ws) {
			console.log('[WS] Connection closed');
			wsClients.delete(ws);
		},
	})

	// REST: latest sensor reading
	.get('/api/sensors/latest', async ({ query }) => {
		const limit = parseInt(query.limit as string) || 1;
		const deviceId = query.deviceId as string | undefined;
		// const rows = await getSensorReadings(deviceId, limit);
		// return {
		// 	success: true,
		// 	data: rows[0] || null,
		// 	timestamp: new Date().toISOString(),
		// };
	})

	// REST: sensor history
	.get('/api/sensors/history', async ({ query }) => {
		const limit = parseInt(query.limit as string) || 100;
		const deviceId = query.deviceId as string | undefined;
		// const rows = await getSensorReadings(deviceId, limit);
		// return {
		// 	success: true,
		// 	data: rows,
		// 	count: rows.length,
		// 	timestamp: new Date().toISOString(),
		// };
	})

	// REST: get config for a device
	.get('/api/sensors/:deviceId/config', async ({ params }) => {
		// const rows = await getSensorSettings(params.deviceId);
		// const cfg = Object.fromEntries(rows.map((r) => [r.setting, r.value]));
		// return { success: true, config: cfg };
	})

	// REST: update config (bulk) for a device
	.post('/api/sensors/:deviceId/config', async ({ params, body }) => {
		const updates = body as Record<string, string>;
		for (const [setting, value] of Object.entries(updates)) {
			const type = isNaN(Number(value)) ? 'string' : 'float';
			// await upsertSensorSetting({
			// 	deviceId: params.deviceId,
			// 	setting,
			// 	value,
			// 	type,
			// });
		}
		return { success: true };
	})

	// Hello World
	.get('/api/', 'Hello World')

	.listen(port, () => {
		console.log(`🚀 Elysia API server is up at http://localhost:${port}`);
		console.log(`🔌 WS endpoint: ws://localhost:${port}/api/ws`);
	});
