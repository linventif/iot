import fs from 'fs';
import path from 'path';

export class WebSocketEvent {
	type: string;
	onData: (wsClient: any, data: any) => Promise<void>;

	constructor() {
		this.type = '';
		this.onData = async () => {
			throw new Error('onData method not implemented');
		};
	}

	setType(type: string) {
		this.type = type;
		return this;
	}

	setOnData(callback: (wsClient: WebSocket, data: any) => Promise<void>) {
		this.onData = callback;
		return this;
	}
}

export async function getAllWebSocketEvents(): Promise<
	Record<string, WebSocketEvent>
> {
	const events: Record<string, WebSocketEvent> = {};
	const eventsDir = path.resolve(__dirname, '../api/events');

	const files = fs
		.readdirSync(eventsDir)
		.filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));

	for (const file of files) {
		const mod = await import(path.join(eventsDir, file));
		const event = mod.default as WebSocketEvent;

		events[event.type] = event;
	}

	return events;
}
