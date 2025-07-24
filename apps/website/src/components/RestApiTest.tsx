import { Component, createSignal } from 'solid-js';
import KobalteButton from './KobalteButton';

const RestApiTest: Component = () => {
	const [output, setOutput] = createSignal(
		'Click a button to test the REST API...'
	);
	const [isLoading, setIsLoading] = createSignal(false);

	const testEndpoint = async (endpoint: string, description: string) => {
		try {
			setIsLoading(true);
			setOutput(`Testing ${description}...`);
			const response = await fetch(endpoint);
			const data = await response.json();

			setOutput(
				`Status: ${response.status}\n` +
					`URL: ${endpoint}\n` +
					`Response: ${JSON.stringify(data, null, 2)}`
			);
		} catch (error) {
			setOutput(
				`Error testing ${description}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div class='api-card'>
			<div class='card-body'>
				<div class='flex items-center gap-3 mb-4'>
					<div class='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							stroke-width='2'
							stroke-linecap='round'
							stroke-linejoin='round'
							class='text-primary'
						>
							<path d='M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z' />
							<polyline points='22,6 12,13 2,6' />
						</svg>
					</div>
					<div>
						<h2 class='card-title text-2xl'>📡 REST API Testing</h2>
						<p class='text-base-content/70'>
							Test HTTP endpoints with interactive buttons
						</p>
					</div>
				</div>

				<div class='alert alert-info mb-6'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						class='stroke-current shrink-0 w-6 h-6'
					>
						<path
							stroke-linecap='round'
							stroke-linejoin='round'
							stroke-width='2'
							d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
					<span>
						Test the REST API endpoints by clicking the buttons
						below. Responses will be displayed in the output area.
					</span>
				</div>

				<div class='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
					<button
						class='btn btn-primary btn-lg gap-2'
						onClick={() =>
							testEndpoint('/api/hello', 'Hello World API')
						}
						disabled={isLoading()}
					>
						{isLoading() && (
							<span class='loading loading-spinner loading-sm'></span>
						)}
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							stroke-width='2'
							stroke-linecap='round'
							stroke-linejoin='round'
						>
							<path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
						</svg>
						Hello API
					</button>

					<button
						class='btn btn-success btn-lg gap-2'
						onClick={() => testEndpoint('/health', 'Health Check')}
						disabled={isLoading()}
					>
						{isLoading() && (
							<span class='loading loading-spinner loading-sm'></span>
						)}
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							stroke-width='2'
							stroke-linecap='round'
							stroke-linejoin='round'
						>
							<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
						</svg>
						Health Check
					</button>

					<button
						class='btn btn-accent btn-lg gap-2'
						onClick={() => testEndpoint('/', 'Root Endpoint')}
						disabled={isLoading()}
					>
						{isLoading() && (
							<span class='loading loading-spinner loading-sm'></span>
						)}
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							stroke-width='2'
							stroke-linecap='round'
							stroke-linejoin='round'
						>
							<path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
							<polyline points='9,22 9,12 15,12 15,22' />
						</svg>
						Root Info
					</button>
				</div>

				<div class='code-output'>
					<pre class='p-4'>
						<code class='text-sm'>{output()}</code>
					</pre>
				</div>
			</div>
		</div>
	);
};

export default RestApiTest;
