import { Elysia } from 'elysia';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { WebSocketEvent } from '../../classes/WebSocketEvent';
import { ElysiaWS } from 'elysia/dist/ws';

type ClientType = 'device' | 'website' | 'unknown';
interface WSClientInfo {
	type: ClientType;
	deviceId?: string;
}

const wsClients = new Map<ElysiaWS, WSClientInfo>();

const events: Record<string, WebSocketEvent> = {};
const eventsDir = path.resolve(__dirname, './events');

const files = fs
	.readdirSync(eventsDir)
	.filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of files) {
	const mod = await import(path.join(eventsDir, file));
	const event = mod.default as WebSocketEvent;

	events[event.type] = event;
}

export const routeWebSocket = new Elysia().ws('/api/ws', {
	async open(ws) {
		console.log('[WS] Connection opened');
		wsClients.set(ws, { type: 'unknown' });
		ws.send(
			JSON.stringify({
				type: 'connected',
				timestamp: new Date().toISOString(),
			})
		);
	},

	async close(ws, code, reason) {
		console.log(`[WS] Connection closed: ${code} – ${reason.toString()}`);
		wsClients.delete(ws);
	},

	async message(ws, raw) {
		let data: any;
		try {
			data = typeof raw === 'string' ? JSON.parse(raw) : raw;
		} catch {
			console.error('[WS] Invalid JSON');
			ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
			return;
		}

		if (!data || !data.type) {
			console.error('[WS] Missing type in message');
			ws.send(JSON.stringify({ type: 'error', error: 'Missing type' }));
			return;
		}

		if (!events[data.type]) {
			console.error(`[WS] Unknown event type: ${data.type}`);
			ws.send(
				JSON.stringify({
					type: 'error',
					error: `Unknown event type: ${data.type}`,
				})
			);
			return;
		}

		try {
			console.log(`[WS] Received event: ${data.type}`);
			await events[data.type].onData(ws, data);
		} catch (error) {
			console.error(`[WS] Error in event ${data.type}:`, error);
			ws.send(
				JSON.stringify({
					type: 'error',
					error: `Error in event ${data.type}`,
				})
			);
		}
	},
});
