import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import 'dotenv/config';
import { routeWebSocket } from './api/websocket';
import { hello } from './api/endpoints/sensor';
import { initDatabase } from './db';

const port = Number(process.env.PORT || 4001);
const hostname = process.env.HOST || '0.0.0.0';
const defaultAllowedOrigins = [
	'https://pool.linv.dev',
	'https://iot.linv.dev',
	'https://iot-dev.linv.dev',
	'http://localhost:4000',
	'http://127.0.0.1:4000',
	'http://localhost:4001',
	'http://127.0.0.1:4001',
	'http://192.168.1.69:4001',
	'http://192.168.1.97:4001',
	'http://192.168.50.71:4001',
];
const allowedOrigins = (
	process.env.API_ALLOWED_ORIGINS || defaultAllowedOrigins.join(',')
)
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

await initDatabase();

new Elysia()
	.use(
		cors({
			origin: allowedOrigins,
			methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
		}) as any
	)
	.use(routeWebSocket)
	.use(hello)
	.listen({ hostname, port }, () => {
		console.log(`🚀 Elysia API server is up at http://${hostname}:${port}`);
		console.log(`🔌 WS endpoint: ws://${hostname}:${port}/api/ws`);
	});
