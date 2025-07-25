import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [solidPlugin(), tailwindcss()],
	server: {
		port: 4000,
		host: '0.0.0.0',
		allowedHosts: ['localhost', 'iot.linv.dev', 'iot-dev.linv.dev'],
	},
	build: {
		target: 'esnext',
	},
});
