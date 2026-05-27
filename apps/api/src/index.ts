import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import 'dotenv/config';
import { routeWebSocket } from './api/websocket';
import { hello } from './api/endpoints/sensor';
import { initDatabase } from './db';

const port = Number(process.env.PORT || 4001);

await initDatabase();

new Elysia()
	.use(
		cors({
			origin: true,
			methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
		}) as any
	)
	.use(routeWebSocket)
	.use(hello)
	.listen(port, () => {
		console.log(`🚀 Elysia API server is up at http://localhost:${port}`);
		console.log(`🔌 WS endpoint: ws://localhost:${port}/api/ws`);
	});
