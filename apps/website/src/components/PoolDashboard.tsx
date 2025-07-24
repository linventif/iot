import { createSignal, onMount, onCleanup } from 'solid-js';

interface SensorData {
	id: number;
	deviceId: string;
	tempPool: string;
	tempOutdoor: string;
	relayState: boolean;
	wifiSignal: number;
	freeHeap: number;
	uptime: number;
	deviceTimestamp: number;
	createdAt: string;
}

export default function PoolDashboard() {
	const [sensorData, setSensorData] = createSignal<SensorData | null>(null);
	const [loading, setLoading] = createSignal(true);
	const [lastUpdate, setLastUpdate] = createSignal<string>('');

	const fetchLatestData = async () => {
		try {
			const response = await fetch('/api/sensors/latest');
			const result = await response.json();
			if (result.success && result.data) {
				setSensorData(result.data);
				setLastUpdate(new Date().toLocaleTimeString());
			}
		} catch (error) {
			console.error('Failed to fetch sensor data:', error);
		} finally {
			setLoading(false);
		}
	};

	onMount(() => {
		fetchLatestData();
		const interval = setInterval(fetchLatestData, 5000); // Update every 5 seconds
		onCleanup(() => clearInterval(interval));
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
				{lastUpdate() && (
					<p class='text-sm text-base-content/50 mt-2'>
						Last updated: {lastUpdate()}
					</p>
				)}
			</div>

			{loading() ? (
				<div class='flex justify-center items-center h-64'>
					<span class='loading loading-spinner loading-lg'></span>
				</div>
			) : (
				<>
					{/* Temperature Cards */}
					<div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Pool Temperature */}
						<div class='card bg-primary text-primary-content'>
							<div class='card-body'>
								<h2 class='card-title text-2xl'>
									🌊 Pool Temperature
								</h2>
								<div class='text-5xl font-bold'>
									{sensorData()?.tempPool || '--'}°C
								</div>
								<p class='opacity-80'>
									Current pool water temperature
								</p>
							</div>
						</div>

						{/* Outdoor Temperature */}
						<div class='card bg-secondary text-secondary-content'>
							<div class='card-body'>
								<h2 class='card-title text-2xl'>
									🌡️ Outdoor Temperature
								</h2>
								<div class='text-5xl font-bold'>
									{sensorData()?.tempOutdoor || '--'}°C
								</div>
								<p class='opacity-80'>
									Ambient air temperature
								</p>
							</div>
						</div>
					</div>

					{/* System Status */}
					<div class='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{/* Relay Status */}
						<div class='card bg-base-100 shadow-xl'>
							<div class='card-body'>
								<h2 class='card-title'>⚡ Pump Status</h2>
								<div class='flex items-center space-x-3'>
									<div
										class={`badge ${sensorData()?.relayState ? 'badge-success' : 'badge-error'} badge-lg`}
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
								</div>
							</div>
						</div>

						{/* WiFi Signal */}
						<div class='card bg-base-100 shadow-xl'>
							<div class='card-body'>
								<h2 class='card-title'>📶 WiFi Signal</h2>
								<div class='flex items-center space-x-3'>
									<div class='text-2xl font-bold'>
										{sensorData()?.wifiSignal || '--'} dBm
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
						</div>

						{/* System Info */}
						<div class='card bg-base-100 shadow-xl'>
							<div class='card-body'>
								<h2 class='card-title'>💾 System Info</h2>
								<div class='space-y-2'>
									<div class='flex justify-between'>
										<span>Uptime:</span>
										<span class='font-mono'>
											{Math.floor(
												(sensorData()?.uptime || 0) / 60
											)}
											m
										</span>
									</div>
									<div class='flex justify-between'>
										<span>Free Heap:</span>
										<span class='font-mono'>
											{Math.round(
												(sensorData()?.freeHeap || 0) /
													1024
											)}
											KB
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Device Info */}
					<div class='card bg-base-100 shadow-xl'>
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
					</div>
				</>
			)}
		</div>
	);
}
