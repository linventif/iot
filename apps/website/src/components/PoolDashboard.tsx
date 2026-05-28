import {
	createMemo,
	createResource,
	createSignal,
	For,
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
type HistoryLimit = '10' | '50' | 'all';

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

function relayStateLabel(value: SensorReading['relayState']): string {
	if (value === true) return 'En marche';
	if (value === false) return 'Arrêtée';
	return '--';
}

export default function PoolDashboard() {
	const [connected, setConnected] = createSignal(false);
	const [lastLiveUpdate, setLastLiveUpdate] = createSignal<Date | null>(null);
	const [historyLimit, setHistoryLimit] = createSignal<HistoryLimit>('10');
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

	async function fetchSensorHistory(
		limit: HistoryLimit
	): Promise<SensorReading[]> {
		const res = await fetch(`${getAPIUrl()}/sensors/history?limit=${limit}`);
		if (!res.ok) throw new Error(res.statusText);
		return (await res.json()) as SensorReading[];
	}

	const [sensorData, { refetch, mutate }] =
		createResource<SensorReading>(fetchLatestSensorData);
	const [sensorHistory, { refetch: refetchHistory, mutate: mutateHistory }] =
		createResource(historyLimit, fetchSensorHistory);

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
	const visibleHistory = createMemo(() => sensorHistory() ?? []);

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
			void refetchHistory();
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'sensor_data') {
					const receivedAt = new Date();
					const reading = {
						...data,
						createdAt: receivedAt,
					};
					setLastLiveUpdate(receivedAt);
					mutate(reading);
					mutateHistory((current = []) => {
						const next = [reading, ...current];
						return historyLimit() === 'all'
							? next
							: next.slice(0, Number(historyLimit()));
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
						onClick={() => {
							void refetch();
							void refetchHistory();
						}}
						disabled={sensorData.loading || sensorHistory.loading}
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
							<h2 class='card-title text-xl'>Température Piscine</h2>
						<div class='text-5xl font-bold'>
							<Show when={!sensorData.loading} fallback='--'>
								{formatTemperature(poolTemp())}
							</Show>
						</div>
							<p class='opacity-80'>Dernière mesure piscine</p>
					</div>
				</section>

				<section class='card bg-secondary text-secondary-content'>
					<div class='card-body'>
							<h2 class='card-title text-xl'>Température Tuyaux Toit</h2>
						<div class='text-5xl font-bold'>
							<Show when={!sensorData.loading} fallback='--'>
								{formatTemperature(outTemp())}
							</Show>
						</div>
							<p class='opacity-80'>Dernière mesure tuyaux toit</p>
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
					<div class='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
						<h2 class='card-title'>Détails de la dernière mesure</h2>
						<select
							class='select select-sm select-bordered w-full md:w-44'
							value={historyLimit()}
							onChange={(event) =>
								setHistoryLimit(event.currentTarget.value as HistoryLimit)
							}
							aria-label='Nombre de mesures affichées'
						>
							<option value='10'>10 mesures</option>
							<option value='50'>50 mesures</option>
							<option value='all'>Toutes les mesures</option>
						</select>
					</div>
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
					<div class='overflow-x-auto mt-4'>
						<table class='table table-sm'>
							<thead>
								<tr>
									<th>Horodatage</th>
									<th>Capteur</th>
									<th>Eau</th>
									<th>Air</th>
									<th>Pompe</th>
									<th>Mode</th>
								</tr>
							</thead>
							<tbody>
								<Show
									when={visibleHistory().length > 0}
									fallback={
										<tr>
											<td colspan='6' class='text-center text-base-content/60'>
												Aucune mesure disponible
											</td>
										</tr>
									}
								>
									<For each={visibleHistory()}>
										{(reading) => (
											<tr>
												<td>{formatDate(reading.createdAt)}</td>
												<td class='font-mono'>{reading.id ?? '--'}</td>
												<td>{formatTemperature(reading.poolTemp)}</td>
												<td>{formatTemperature(reading.outTemp)}</td>
												<td>{relayStateLabel(reading.relayState)}</td>
												<td>{forceStateLabel(reading.forceState)}</td>
											</tr>
										)}
									</For>
								</Show>
							</tbody>
						</table>
					</div>
				</div>
			</section>
		</div>
	);
}
