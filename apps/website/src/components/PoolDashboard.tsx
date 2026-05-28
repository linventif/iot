import {
	createMemo,
	createResource,
	createSignal,
	onCleanup,
	onMount,
	Show,
} from 'solid-js';
import type {
	SensorDataBaseType,
	SensorDataWebSocketType,
} from '@schemas/src/SensorData';
import { getAPIUrl, getWebSocketUrl } from '../utils/utils';

type SensorReading = Partial<SensorDataBaseType & SensorDataWebSocketType>;

function formatTemperature(value: unknown): string {
	return typeof value === 'number' ? `${value.toFixed(1)} °C` : '--';
}

function formatDate(value: unknown): string {
	if (!value) return 'Aucune mesure';

	const date = new Date(value as string | Date);
	if (Number.isNaN(date.getTime())) return 'Aucune mesure';

	return new Intl.DateTimeFormat('fr-FR', {
		dateStyle: 'short',
		timeStyle: 'medium',
	}).format(date);
}

function forceStateLabel(value: SensorReading['forceState']): string {
	if (value === 'ON') return 'Forcée ON';
	if (value === 'OFF') return 'Forcée OFF';
	if (value === 'AUTO') return 'Automatique';
	return '--';
}

export default function PoolDashboard() {
	const [connected, setConnected] = createSignal(false);
	const [lastLiveUpdate, setLastLiveUpdate] = createSignal<Date | null>(null);
	const [connectionError, setConnectionError] = createSignal<string | null>(
		null
	);
	let ws: WebSocket | null = null;
	let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
	let shouldReconnect = true;

	async function fetchLatestSensorData(): Promise<SensorReading> {
		const res = await fetch(`${getAPIUrl()}/sensors/latest`);
		if (!res.ok) throw new Error(res.statusText);
		return (await res.json()) as SensorReading;
	}

	const [sensorData, { refetch, mutate }] =
		createResource<SensorReading>(fetchLatestSensorData);

	const poolTemp = createMemo(() => sensorData()?.poolTemp);
	const outTemp = createMemo(() => sensorData()?.outTemp);
	const tempGap = createMemo(() => {
		const pool = poolTemp();
		const outside = outTemp();
		return typeof pool === 'number' && typeof outside === 'number'
			? pool - outside
			: undefined;
	});
	const latestUpdate = createMemo(
		() => lastLiveUpdate() ?? sensorData()?.createdAt
	);

	const connectWebSocket = () => {
		clearTimeout(reconnectTimer);

		try {
			ws = new WebSocket(getWebSocketUrl());
		} catch (error) {
			setConnected(false);
			setConnectionError('Connexion temps réel indisponible');
			reconnectTimer = setTimeout(connectWebSocket, 3000);
			return;
		}

		ws.onopen = () => {
			setConnected(true);
			setConnectionError(null);
			ws?.send(
				JSON.stringify({ type: 'register', clientType: 'website' })
			);
			void refetch();
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'sensor_data') {
					const receivedAt = new Date();
					setLastLiveUpdate(receivedAt);
					mutate({
						...data,
						createdAt: receivedAt,
					});
				}
			} catch (error) {
				console.error('Erreur pendant la lecture du message temps réel:', error);
			}
		};

		ws.onclose = () => {
			setConnected(false);
			if (shouldReconnect) {
				reconnectTimer = setTimeout(connectWebSocket, 3000);
			}
		};

		ws.onerror = () => {
			setConnected(false);
			setConnectionError('Erreur de connexion temps réel');
		};
	};

	onMount(() => {
		connectWebSocket();
		onCleanup(() => {
			shouldReconnect = false;
			clearTimeout(reconnectTimer);
			ws?.close();
		});
	});

	return (
		<div class='container mx-auto max-w-6xl p-4 md:p-6 space-y-6'>
			<header class='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
				<div>
					<h1 class='text-3xl md:text-4xl font-bold text-base-content'>
						Suivi de la piscine
					</h1>
					<p class='text-base-content/70 mt-2'>
						Températures, pompe et dernières mesures en temps réel.
					</p>
				</div>
				<div class='flex flex-wrap items-center gap-2'>
					<div
						class={`badge ${
							connected() ? 'badge-success' : 'badge-error'
						} badge-lg`}
					>
						{connected() ? 'Temps réel actif' : 'Temps réel coupé'}
					</div>
					<button
						type='button'
						class='btn btn-sm btn-outline'
						onClick={() => refetch()}
						disabled={sensorData.loading}
					>
						Actualiser
					</button>
				</div>
			</header>

			<Show when={connectionError()}>
				<div class='alert alert-warning'>
					<span>{connectionError()}</span>
				</div>
			</Show>

			<div class='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<section class='card bg-primary text-primary-content'>
					<div class='card-body'>
						<h2 class='card-title text-xl'>Température de l'eau</h2>
						<div class='text-5xl font-bold'>
							<Show when={!sensorData.loading} fallback='--'>
								{formatTemperature(poolTemp())}
							</Show>
						</div>
						<p class='opacity-80'>Dernière mesure du bassin</p>
					</div>
				</section>

				<section class='card bg-secondary text-secondary-content'>
					<div class='card-body'>
						<h2 class='card-title text-xl'>Température extérieure</h2>
						<div class='text-5xl font-bold'>
							<Show when={!sensorData.loading} fallback='--'>
								{formatTemperature(outTemp())}
							</Show>
						</div>
						<p class='opacity-80'>Air ambiant autour de la piscine</p>
					</div>
				</section>
			</div>

			<div class='stats stats-vertical lg:stats-horizontal shadow w-full'>
				<div class='stat'>
					<div class='stat-title'>Écart eau / air</div>
					<div class='stat-value text-2xl'>
						{typeof tempGap() === 'number'
							? `${tempGap()!.toFixed(1)} °C`
							: '--'}
					</div>
					<div class='stat-desc'>Différence de température</div>
				</div>

				<div class='stat'>
					<div class='stat-title'>Pompe</div>
					<div
						class={`stat-value text-2xl ${
							typeof sensorData()?.relayState !== 'boolean'
								? ''
								: sensorData()?.relayState
								? 'text-success'
								: 'text-error'
						}`}
					>
						{typeof sensorData()?.relayState === 'boolean'
							? sensorData()?.relayState
								? 'En marche'
								: 'Arrêtée'
							: '--'}
					</div>
					<div class='stat-desc'>État du relais</div>
				</div>

				<div class='stat'>
					<div class='stat-title'>Mode</div>
					<div class='stat-value text-2xl'>
						{forceStateLabel(sensorData()?.forceState)}
					</div>
					<div class='stat-desc'>Commande actuelle</div>
				</div>

				<div class='stat'>
					<div class='stat-title'>Dernière mise à jour</div>
					<div class='stat-value text-lg'>
						{formatDate(latestUpdate())}
					</div>
					<div class='stat-desc'>
						{lastLiveUpdate() ? 'Reçue en direct' : 'Chargée depuis l’API'}
					</div>
				</div>
			</div>

			<section class='card bg-base-100 shadow'>
				<div class='card-body'>
					<h2 class='card-title'>Détails de la dernière mesure</h2>
					<div class='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
						<div class='flex justify-between gap-4'>
							<span class='text-base-content/70'>Identifiant capteur</span>
							<span class='font-mono'>{sensorData()?.id ?? '--'}</span>
						</div>
						<div class='flex justify-between gap-4'>
							<span class='text-base-content/70'>Horodatage</span>
							<span>{formatDate(sensorData()?.createdAt)}</span>
						</div>
						<div class='flex justify-between gap-4'>
							<span class='text-base-content/70'>Eau</span>
							<span>{formatTemperature(poolTemp())}</span>
						</div>
						<div class='flex justify-between gap-4'>
							<span class='text-base-content/70'>Air</span>
							<span>{formatTemperature(outTemp())}</span>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
