export function getAPIUrl(): string {
	if (window.location.hostname === 'localhost') {
		return 'http://localhost:4001';
	}
	return `https://iot-api.linv.dev/api`;
}
