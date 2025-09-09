import {
	createSignal,
	onMount,
	onCleanup,
	createResource,
	Show,
} from 'solid-js';
import { SensorDataWebSocketType } from '@schemas/src/SensorData';
import { getAPIUrl } from '../utils/utils';

export default function PoolDashboard() {
	// const [loading, setLoading] = createSignal(true);
	// const [lastUpdate, setLastUpdate] = createSignal<string>('');
	const [connected, setConnected] = createSignal(false);
	const [forceRelay, setForceRelay] = createSignal(false);
	const [forceRelayLoading, setForceRelayLoading] = createSignal(false);
	let ws: WebSocket | null = null;

	async function fetchLatestSensorData(): Promise<SensorDataWebSocketType> {
		const res = await fetch(`${getAPIUrl()}/sensors/latest`);
		if (!res.ok) throw new Error(res.statusText);
		return (await res.json()) as SensorDataWebSocketType;
	}

	const [
		sensorData,
		{ refetch: refetchSensorData, mutate: mutateSensorData },
	] = createResource<SensorDataWebSocketType>(fetchLatestSensorData);

	// const fetchForceRelay = async () => {
	// 	try {
	// 		const res = await fetch(`/api/sensors/${deviceId()}/settings`);
	// 		const data = await res.json();
	// 		if (data.success) {
	// 			const setting = data.settings.find(
	// 				(s: any) => s.setting === 'force_on_off'
	// 			);
	// 			setForceRelay(setting?.value === 'true');
	// 		}
	// 	} catch {}
	// };

	// const updateForceRelay = async (value: boolean) => {
	// 	setForceRelayLoading(true);
	// 	await fetch(`/api/sensors/${deviceId()}/settings`, {
	// 		method: 'POST',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify({
	// 			setting: 'force_on_off',
	// 			value: String(value),
	// 			type: 'boolean',
	// 		}),
	// 	});
	// 	setForceRelay(value);
	// 	setForceRelayLoading(false);
	// };

	// const fetchLatestData = async () => {
	// 	try {
	// 		const response = await fetch('/api/sensors/latest');
	// 		const result = await response.json();
	// 		if (result.success && result.data) {
	// 			setSensorData(result.data);
	// 			setLastUpdate(new Date().toLocaleTimeString());
	// 		}
	// 	} catch (error) {
	// 		console.error('Failed to fetch sensor data:', error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	const connectWebSocket = () => {
		const wsUrl = `ws://${window.location.hostname}:4001/api/ws`;
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			setConnected(true);
			// Register as website client
			ws?.send(
				JSON.stringify({ type: 'register', clientType: 'website' })
			);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'sensor_data') {
					// mutateSensorData(data as SensorDataWebSocketType);
					// setLastUpdate(new Date().toLocaleTimeString());
					// setLoading(false);
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};

		ws.onclose = () => {
			setConnected(false);
			setTimeout(connectWebSocket, 3000);
		};

		ws.onerror = () => {
			setConnected(false);
		};
	};

	onMount(() => {
		connectWebSocket();
		onCleanup(() => {
			// clearInterval(interval);
			if (ws) ws.close();
		});
	});

	return (
		<div class='container mx-auto p-6 space-y-6'>
			{/* Header */}
			<div class='text-center'>
				<h1 class='text-4xl font-bold text-base-content mb-2'>
					🏊‍♂️ Pool Monitor
				</h1>
				<p class='text-base-content/70'>
					Real-time pool monitoring system
				</p>
				<div class='flex justify-center items-center gap-2 mt-2'>
					<div
						class={`badge ${
							connected() ? 'badge-success' : 'badge-error'
						}`}
					>
						{connected() ? '🟢 Connected' : '🔴 Disconnected'}
					</div>
					{/* {lastUpdate() && (
						<p class='text-sm text-base-content/50 mt-0'>
							Last updated: {lastUpdate()}
						</p>
					)} */}
				</div>
			</div>

			{/* {loading() ? (
				<div class='flex justify-center items-center h-64'>
					<span class='loading loading-spinner loading-lg'></span>
				</div>
			) : (
				<> */}
			{/* Temperature Cards */}
			<div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{/* Pool Temperature */}
				<div class='card bg-primary text-primary-content'>
					<div class='card-body'>
						<h2 class='card-title text-2xl'>🌊 Pool Temperature</h2>
						<div class='text-5xl font-bold'>
							<Show when={!sensorData.loading} fallback='--'>
								{sensorData()?.poolTemp !== undefined
									? Number(sensorData()!.poolTemp).toFixed(1)
									: '--'}
								°C
							</Show>
						</div>
						<p class='opacity-80'>Current pool water temperature</p>
					</div>
				</div>

				{/* Outdoor Temperature */}
				<div class='card bg-secondary text-secondary-content'>
					<div class='card-body'>
						<h2 class='card-title text-2xl'>
							🌡️ Outdoor Temperature
						</h2>
						<div class='text-5xl font-bold'>
							<Show when={!sensorData.loading} fallback='--'>
								{sensorData()?.outTemp !== undefined
									? Number(sensorData()!.outTemp).toFixed(1)
									: '--'}
								°C
							</Show>
						</div>
						<p class='opacity-80'>Ambient air temperature</p>
					</div>
				</div>
			</div>

			{/* System Status */}
			{/* <div class='grid grid-cols-1 md:grid-cols-3 gap-6'> */}
			{/* Relay Status */}
			{/* <div class='card bg-base-100 shadow-xl'>
							<div class='card-body'>
								<h2 class='card-title'>⚡ Pump Status</h2>
								<div class='flex items-center space-x-3'>
									<div
										class={`badge ${
											sensorData()?.relayState
												? 'badge-success'
												: 'badge-error'
										} badge-lg`}
									>
										{sensorData()?.relayState
											? 'ON'
											: 'OFF'}
									</div>
									<span class='text-lg'>
										{sensorData()?.relayState
											? '🟢 Running'
											: '🔴 Stopped'}
									</span>
								</div> */}
			{/* Force Relay Switch */}
			{/* <div class='mt-4 flex items-center gap-3'>
									<input
										type='checkbox'
										class='toggle toggle-primary'
										checked={forceRelay()}
										disabled={forceRelayLoading()}
										onChange={(e) =>
											updateForceRelay(
												e.currentTarget.checked
											)
										}
										id='force-relay-toggle'
									/>
									<label
										for='force-relay-toggle'
										class='cursor-pointer'
									>
										Force Relay{' '}
										{forceRelay() ? (
											<span class='text-success ml-1'>
												ON
											</span>
										) : (
											<span class='text-error ml-1'>
												OFF
											</span>
										)}
									</label>
									{forceRelayLoading() && (
										<span class='loading loading-spinner loading-xs'></span>
									)}
								</div>
							</div>
						</div>
						WiFi Signal
						<div class='card bg-base-100 shadow-xl'>
							<div class='card-body'>
								<h2 class='card-title'>📶 WiFi Signal</h2>
								<div class='flex items-center space-x-3'>
									<div class='text-2xl font-bold'>
										{sensorData()?.wifiSignal !== undefined
											? Number(
													sensorData()!.wifiSignal
											  ).toFixed(1)
											: '--'}{' '}
										dBm
									</div>
									<div
										class={`badge ${
											(sensorData()?.wifiSignal || 0) >
											-50
												? 'badge-success'
												: (sensorData()?.wifiSignal ||
														0) > -70
												? 'badge-warning'
												: 'badge-error'
										}`}
									>
										{(sensorData()?.wifiSignal || 0) > -50
											? 'Excellent'
											: (sensorData()?.wifiSignal || 0) >
											  -70
											? 'Good'
											: 'Poor'}
									</div>
								</div>
							</div>
						</div> */}
			{/* System Info */}
			{/* <div class='card bg-base-100 shadow-xl'>
							<div class='card-body'>
								<h2 class='card-title'>💾 System Info</h2>
								<div class='space-y-2'>
									<div class='flex justify-between'>
										<span>Uptime:</span>
										<span class='font-mono'>
											{sensorData()?.uptime !== undefined
												? (
														Number(
															sensorData()!.uptime
														) / 60
												  ).toFixed(1)
												: '0'}
											m
										</span>
									</div>
									<div class='flex justify-between'>
										<span>Free Heap:</span>
										<span class='font-mono'>
											{sensorData()?.freeHeap !==
											undefined
												? (
														Number(
															sensorData()!
																.freeHeap
														) / 1024
												  ).toFixed(1)
												: '0'}
											KB
										</span>
									</div>
								</div>
							</div>
						</div>
					</div> */}

			{/* Device Info */}
			{/* <div class='card bg-base-100 shadow-xl'>
						<div class='card-body'>
							<h2 class='card-title'>🔧 Device Information</h2>
							<div class='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<span class='font-semibold'>
										Device ID:
									</span>
									<span class='ml-2 font-mono text-sm'>
										{sensorData()?.deviceId || 'Unknown'}
									</span>
								</div>
								<div>
									<span class='font-semibold'>
										Last Reading:
									</span>
									<span class='ml-2'>
										{sensorData()?.createdAt
											? new Date(
													sensorData()!.createdAt
												).toLocaleString()
											: 'Never'}
									</span>
								</div>
							</div>
						</div>
					</div> */}
			{/* </> */}
			{/* )} */}
		</div>
	);
}
