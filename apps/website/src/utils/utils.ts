export function getAPIUrl(): string {
	if (window.location.hostname === 'localhost') {
		return 'http://localhost:4001';
	}
	return `https://iot-api.linv.dev/api`;
}

export function getWebSocketUrl(): string {
	if (window.location.hostname === 'localhost') {
		return 'ws://localhost:4001/api/ws';
	}
	return 'wss://iot-api.linv.dev/api/ws';
}
