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
