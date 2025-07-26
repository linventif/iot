import { Elysia } from 'elysia';
const cacheTokens = new Map<string, string>();

function generateNewToken(): string {
	const token = Math.random().toString(36).substring(2, 15);
	cacheTokens.set(token, token);
	return token;
}

export const auth = new Elysia().post('/auth', async ({ set, body }) => {
	const { password } = body as { password: string };
	if (!password) {
		set.status = 400;
		return { error: 'Password is required' };
	}
	return {
		token: generateNewToken(),
	};
});

export const authMiddleware = new Elysia().onBeforeHandle(
	({ request, set }) => {
		const auth = request.headers.get('authorization');
		if (!auth || auth !== 'Bearer secret') {
			set.status = 401;
			return 'Unauthorized';
		}
	}
);
