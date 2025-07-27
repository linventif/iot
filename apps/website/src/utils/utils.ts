export function getAPIUrl(): string {
	if (window.location.hostname === 'localhost') {
		return 'http://localhost:4001';
	}
	return `${window.location.protocol}//${window.location.host}`;
}
