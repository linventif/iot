import { Elysia } from 'elysia';

const port = process.env.PORT || 4001;
console.log(`port: ${port}`);

new Elysia()
	// REST API Hello World endpoint
	.get('/api/hello', () => {
		return {
			message: 'Hello World from REST API!',
			timestamp: new Date().toISOString(),
			status: 'success',
		};
	})
	// WebSocket Hello World endpoint
	.ws('/api/ws', {
		message(ws, message) {
			console.log('Received message:', message);

			// Send hello world response back to client
			ws.send({
				type: 'hello_response',
				message: 'Hello World from WebSocket!',
				originalMessage: message,
				timestamp: new Date().toISOString(),
			});
		},

		open(ws) {
			console.log('WebSocket connection opened');

			// Send welcome message when client connects
			ws.send({
				type: 'welcome',
				message: 'Hello World! WebSocket connection established.',
				timestamp: new Date().toISOString(),
			});
		},

		close(ws) {
			console.log('WebSocket connection closed');
		},
	})
	// Health check endpoint
	.get('/api/health', () => {
		return {
			status: 'healthy',
			timestamp: new Date().toISOString(),
		};
	})
	// Root endpoint (the /api is bc of cloudflare)
	.get('/api/', () => {
		return {
			message: 'Auto Pool Pump API Server',
			endpoints: {
				rest: '/hello',
				websocket: '/ws',
				health: '/health',
			},
		};
	})
	.listen(port);
