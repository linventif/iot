// esp32-simulator.ts
import WebSocket from 'ws';

const WS_URL = 'ws://localhost:4001/api/ws';
const DEVICE_ID = 'esp32-pool-001';
const TEMP_THRESHOLD = 3.5;
const WS_SEND_INTERVAL = 5000;

let forcedState: 'ON' | 'OFF' | 'AUTO' = 'AUTO';
let relayState = false;
const startedAt = Date.now();

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
	console.log(`[ESP] Connected to ${WS_URL}`);

	setInterval(() => {
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
		console.log('[ESP] Sent:', msg);
	}, WS_SEND_INTERVAL);
});

ws.on('error', (err) => {
	console.error('[ESP] WebSocket error:', err);
});

ws.on('close', (code, reason) => {
	console.warn(
		`[ESP] WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`
	);
});

ws.on('unexpected-response', (req, res) => {
	console.error(
		'[ESP] Unexpected WS response:',
		res.statusCode,
		res.statusMessage
	);
});

ws.on('message', (data) => {
	console.log('[ESP] Server response:', data.toString());
});

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
