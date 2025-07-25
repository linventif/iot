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
		const t = (Date.now() - startedAt) / 1000; // secondes depuis le début

		// variation lente de la moyenne via sinusoïde (24h = 86400s)
		const poolMean = 25 + 2 * Math.sin(((2 * Math.PI) / 300) * t); // 25°C ±2°C sur ~5 minutes
		const outdoorMean = 20 + 4 * Math.sin(((2 * Math.PI) / 300) * t); // 20°C ±4°C

		const tempPool = gaussian(poolMean, 0.3); // bruit léger autour de la tendance
		const tempOutdoor = gaussian(outdoorMean, 0.5);

		updateRelayState(tempPool, tempOutdoor);

		const msg = {
			id: DEVICE_ID,
			tempPool: round(tempPool),
			tempOutdoor: round(tempOutdoor),
			relayState,
			wifiSignal: -55 + Math.floor(Math.random() * 10),
			freeHeap: 200000 + Math.floor(Math.random() * 20000),
			uptime: Math.floor((Date.now() - startedAt) / 1000),
		};

		ws.send(JSON.stringify(msg));
		console.log('[ESP] Sent:', msg);
	}, WS_SEND_INTERVAL);
});

ws.on('message', (data) => {
	console.log('[ESP] Server response:', data.toString());
});

function updateRelayState(tempPool: number, tempOutdoor: number) {
	if (forcedState === 'ON') relayState = true;
	else if (forcedState === 'OFF') relayState = false;
	else relayState = tempPool - tempOutdoor <= TEMP_THRESHOLD;
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
