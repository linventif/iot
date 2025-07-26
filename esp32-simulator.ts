import WebSocket from 'ws';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
	.option('cfg', {
		alias: 'config',
		type: 'boolean',
		description: 'Send current configuration on connect',
		default: true,
	})
	.option('data', {
		alias: 'sensor',
		type: 'boolean',
		description: 'Send periodic sensor data',
		default: true,
	})
	.option('delay', {
		alias: 'interval',
		type: 'number',
		description: 'Interval between sensor data (ms)',
		default: 5000,
	})
	.parseSync();

const WS_URL = 'ws://localhost:4001/api/ws';
const DEVICE_ID = 'esp32-pool-001';
const TEMP_THRESHOLD = 3.5;
let forcedState: 'ON' | 'OFF' | 'AUTO' = 'AUTO';
let relayState = false;
let ws: WebSocket | null = null;
let isConnected = false;
const startedAt = Date.now();

function connectWebSocket() {
	ws = new WebSocket(WS_URL);

	ws.on('open', () => {
		isConnected = true;
		console.log(`[ESP] Connected to ${WS_URL}`);

		if (argv.cfg) {
			const cfg = {
				type: 'current_config',
				deviceId: DEVICE_ID,
				tempThreshold: TEMP_THRESHOLD,
				forceState: forcedState,
			};
			ws!.send(JSON.stringify(cfg));
			console.log('[ESP] Sent current_cfg:', cfg);
		}
	});

	ws.on('close', (code, reason) => {
		console.warn(`[ESP] WS closed: ${code} – ${reason.toString()}`);
		isConnected = false;
		setTimeout(connectWebSocket, 3000);
	});

	ws.on('error', (err) => {
		console.error('[ESP] WS error:', err);
		isConnected = false;
		ws?.close();
	});

	ws.on('message', (data) => {
		console.log('[ESP] Server response:', data.toString());
	});
}

function startSensorLoop() {
	if (!argv.data) return;

	setInterval(() => {
		if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) return;

		const t = (Date.now() - startedAt) / 1000;
		const poolMean = 25 + 2 * Math.sin(((2 * Math.PI) / 300) * t);
		const outMean = 20 + 4 * Math.sin(((2 * Math.PI) / 300) * t);
		const poolTemp = gaussian(poolMean, 0.3);
		const outTemp = gaussian(outMean, 0.5);
		updateRelayState(poolTemp, outTemp);

		const msg = {
			type: 'sensor_data',
			id: DEVICE_ID,
			poolTemp: round(poolTemp),
			outTemp: round(outTemp),
			relayState,
			forceState: forcedState,
		};

		ws.send(JSON.stringify(msg));
		console.log('[ESP] Sent sensor_data:', msg);
	}, argv.delay);
}

function updateRelayState(poolTemp: number, outTemp: number) {
	if (forcedState === 'ON') relayState = true;
	else if (forcedState === 'OFF') relayState = false;
	else relayState = poolTemp - outTemp <= TEMP_THRESHOLD;
}

function round(v: number) {
	return Math.round(v * 10000) / 10000;
}

function gaussian(mean: number, stddev: number): number {
	let u = 0,
		v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	return z * stddev + mean;
}

// 🚀 Boot
connectWebSocket();
startSensorLoop();
