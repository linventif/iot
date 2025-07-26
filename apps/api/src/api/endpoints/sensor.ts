import Elysia from 'elysia';

export const hello = new Elysia().get('/', () => 'Hello World!');

// // REST: latest sensor reading
// .get('/api/sensors/latest', async ({ query }) => {
// 	const limit = parseInt(query.limit as string) || 1;
// 	const deviceId = query.deviceId as string | undefined;
// 	// const rows = await getSensorReadings(deviceId, limit);
// 	// return {
// 	// 	success: true,
// 	// 	data: rows[0] || null,
// 	// 	timestamp: new Date().toISOString(),
// 	// };
// })

// // REST: sensor history
// .get('/api/sensors/history', async ({ query }) => {
// 	const limit = parseInt(query.limit as string) || 100;
// 	const deviceId = query.deviceId as string | undefined;
// 	// const rows = await getSensorReadings(deviceId, limit);
// 	// return {
// 	// 	success: true,
// 	// 	data: rows,
// 	// 	count: rows.length,
// 	// 	timestamp: new Date().toISOString(),
// 	// };
// })

// // REST: get config for a device
// .get('/api/sensors/:deviceId/config', async ({ params }) => {
// 	// const rows = await getSensorSettings(params.deviceId);
// 	// const cfg = Object.fromEntries(rows.map((r) => [r.setting, r.value]));
// 	// return { success: true, config: cfg };
// })

// // REST: update config (bulk) for a device
// .post('/api/sensors/:deviceId/config', async ({ params, body }) => {
// 	const updates = body as Record<string, string>;
// 	for (const [setting, value] of Object.entries(updates)) {
// 		const type = isNaN(Number(value)) ? 'string' : 'float';
// 		// await upsertSensorSetting({
// 		// 	deviceId: params.deviceId,
// 		// 	setting,
// 		// 	value,
// 		// 	type,
// 		// });
// 	}
// 	return { success: true };
// })
