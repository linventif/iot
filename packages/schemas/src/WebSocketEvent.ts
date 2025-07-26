import { z } from 'zod';

export const WebSocketEventSchema = z.object({
	type: z.string(),
	onData: z.function(),
});

export type WebSocketEventType = z.infer<typeof WebSocketEventSchema>;
