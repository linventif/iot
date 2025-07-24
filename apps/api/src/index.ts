import { Elysia } from 'elysia';

const app = new Elysia()
	// Serve test client at /test for easy access
	.get('/test', () => Bun.file('src/test-client.html'))

	// REST API Hello World endpoint
	.get('/api/hello', () => {
		return {
			message: 'Hello World from REST API!',
			timestamp: new Date().toISOString(),
			status: 'success',
		};
	})

	// WebSocket Hello World endpoint
	.ws('/ws', {
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
	.get('/health', () => {
		return {
			status: 'healthy',
			timestamp: new Date().toISOString(),
		};
	})

	// Root endpoint
	.get('/', () => {
		return {
			message: 'Auto Pool Pump API Server',
			endpoints: {
				rest: '/api/hello',
				websocket: '/ws',
				health: '/health',
				testClient: '/test',
			},
		};
	});

const port = process.env.PORT || 4001;

app.listen(port, () => {
	console.log(`🚀 Elysia server is running on http://localhost:${port}`);
	console.log(`📡 REST API: http://localhost:${port}/api/hello`);
	console.log(`🔌 WebSocket: ws://localhost:${port}/ws`);
	console.log(`🧪 Test Client: http://localhost:${port}/test`);
});

export default app;
