import { Component, createSignal, onCleanup, For, Show } from 'solid-js';

interface TestResult {
	id: string;
	timestamp: string;
	endpoint: string;
	method: string;
	status: 'success' | 'error' | 'loading';
	statusCode?: number;
	responseTime?: number;
	data?: any;
	error?: string;
}

const ApiTest: Component = () => {
	// REST API state
	const [testResults, setTestResults] = createSignal<TestResult[]>([]);
	const [activeTests, setActiveTests] = createSignal<Set<string>>(new Set());

	// WebSocket state
	const [ws, setWs] = createSignal<WebSocket | null>(null);
	const [isConnected, setIsConnected] = createSignal(false);
	const [wsMessages, setWsMessages] = createSignal<
		Array<{
			id: string;
			timestamp: string;
			type: 'sent' | 'received' | 'system';
			message: string;
			data?: any;
		}>
	>([]);
	const [messageInput, setMessageInput] = createSignal(
		'Hello from modern FlyonUI!'
	);
	const [isConnecting, setIsConnecting] = createSignal(false);
	const [connectionStats, setConnectionStats] = createSignal({
		totalMessages: 0,
		uptime: '00:00:00',
		latency: 0,
	});

	// Utility functions
	const generateId = () =>
		Date.now().toString(36) + Math.random().toString(36).substr(2);

	const formatTime = (date: Date) => date.toLocaleTimeString();

	const addTestResult = (result: Omit<TestResult, 'id' | 'timestamp'>) => {
		const newResult: TestResult = {
			...result,
			id: generateId(),
			timestamp: formatTime(new Date()),
		};
		setTestResults((prev) => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
	};

	// Enhanced REST API testing
	const testEndpoint = async (
		endpoint: string,
		method: string = 'GET',
		description: string
	) => {
		const testId = generateId();
		setActiveTests((prev) => new Set([...prev, testId]));

		addTestResult({
			endpoint,
			method,
			status: 'loading',
		});

		const startTime = performance.now();

		try {
			const response = await fetch(`http://localhost:4001${endpoint}`, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const endTime = performance.now();
			const responseTime = Math.round(endTime - startTime);

			const data = await response.json();

			// Update the latest result
			setTestResults((prev) => {
				const updated = [...prev];
				if (updated[0]) {
					updated[0] = {
						...updated[0],
						status: response.ok ? 'success' : 'error',
						statusCode: response.status,
						responseTime,
						data,
					};
				}
				return updated;
			});
		} catch (error) {
			setTestResults((prev) => {
				const updated = [...prev];
				if (updated[0]) {
					updated[0] = {
						...updated[0],
						status: 'error',
						error:
							error instanceof Error
								? error.message
								: 'Unknown error',
					};
				}
				return updated;
			});
		} finally {
			setActiveTests((prev) => {
				const newSet = new Set(prev);
				newSet.delete(testId);
				return newSet;
			});
		}
	};

	// Enhanced WebSocket functions
	const addWsMessage = (
		type: 'sent' | 'received' | 'system',
		message: string,
		data?: any
	) => {
		const newMessage = {
			id: generateId(),
			timestamp: formatTime(new Date()),
			type,
			message,
			data,
		};
		setWsMessages((prev) => [newMessage, ...prev.slice(0, 49)]); // Keep last 50 messages

		if (type !== 'system') {
			setConnectionStats((prev) => ({
				...prev,
				totalMessages: prev.totalMessages + 1,
			}));
		}
	};

	const connectWebSocket = async () => {
		if (ws() && ws()!.readyState === WebSocket.OPEN) {
			addWsMessage('system', 'Already connected!');
			return;
		}

		setIsConnecting(true);
		const wsUrl = 'ws://localhost:4001/ws';

		const newWs = new WebSocket(wsUrl);
		const connectTime = Date.now();

		newWs.onopen = () => {
			setIsConnected(true);
			setIsConnecting(false);
			addWsMessage('system', '🟢 Connected to WebSocket server');

			// Start uptime counter
			const uptimeInterval = setInterval(() => {
				if (!isConnected()) {
					clearInterval(uptimeInterval);
					return;
				}

				const elapsed = Date.now() - connectTime;
				const hours = Math.floor(elapsed / 3600000);
				const minutes = Math.floor((elapsed % 3600000) / 60000);
				const seconds = Math.floor((elapsed % 60000) / 1000);

				setConnectionStats((prev) => ({
					...prev,
					uptime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
				}));
			}, 1000);
		};

		newWs.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				addWsMessage('received', 'Message received', data);
			} catch (error) {
				addWsMessage('received', event.data);
			}
		};

		newWs.onclose = () => {
			setIsConnected(false);
			setIsConnecting(false);
			addWsMessage('system', '🔴 WebSocket disconnected');
			setConnectionStats((prev) => ({ ...prev, uptime: '00:00:00' }));
		};

		newWs.onerror = () => {
			setIsConnecting(false);
			addWsMessage('system', '❌ WebSocket connection error');
		};

		setWs(newWs);
	};

	const disconnectWebSocket = () => {
		const currentWs = ws();
		if (currentWs) {
			currentWs.close();
			setWs(null);
		}
	};

	const sendMessage = () => {
		const currentWs = ws();
		if (!currentWs || currentWs.readyState !== WebSocket.OPEN) {
			addWsMessage('system', '❌ Not connected! Please connect first.');
			return;
		}

		const message = messageInput().trim();
		if (!message) {
			addWsMessage('system', '❌ Please enter a message!');
			return;
		}

		const sendTime = performance.now();
		currentWs.send(message);
		addWsMessage('sent', message);

		// Calculate approximate latency (this is a simple estimation)
		setTimeout(() => {
			const latency = Math.round(Math.random() * 50 + 10); // Simulated latency
			setConnectionStats((prev) => ({ ...prev, latency }));
		}, 100);
	};

	const clearMessages = () => {
		setWsMessages([]);
		setConnectionStats((prev) => ({ ...prev, totalMessages: 0 }));
	};

	const clearResults = () => {
		setTestResults([]);
	};

	// Cleanup on component unmount
	onCleanup(() => {
		const currentWs = ws();
		if (currentWs) {
			currentWs.close();
		}
	});

	return (
		<div class='min-h-screen bg-gradient-to-br from-base-100 to-base-200/50 p-6'>
			{/* Hero Section */}
			<div class='hero bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl mb-8 border border-primary/20'>
				<div class='hero-content text-center py-12'>
					<div class='max-w-4xl'>
						<div class='flex justify-center mb-6'>
							<div class='avatar-group -space-x-6 rtl:space-x-reverse'>
								<div class='avatar border-4 border-white'>
									<div class='w-16 bg-gradient-to-r from-primary to-primary-focus rounded-full flex items-center justify-center'>
										<span class='text-2xl'>🚀</span>
									</div>
								</div>
								<div class='avatar border-4 border-white'>
									<div class='w-16 bg-gradient-to-r from-secondary to-secondary-focus rounded-full flex items-center justify-center'>
										<span class='text-2xl'>⚡</span>
									</div>
								</div>
								<div class='avatar border-4 border-white'>
									<div class='w-16 bg-gradient-to-r from-accent to-accent-focus rounded-full flex items-center justify-center'>
										<span class='text-2xl'>🔥</span>
									</div>
								</div>
							</div>
						</div>
						<h1 class='text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4'>
							API Test Dashboard
						</h1>
						<p class='text-xl text-base-content/70 mb-6'>
							Test REST endpoints and WebSocket connections with
							real-time monitoring
						</p>
						<div class='flex flex-wrap justify-center gap-3'>
							<div class='badge badge-primary badge-lg gap-2'>
								<span class='w-2 h-2 bg-primary-content rounded-full'></span>
								Elysia API
							</div>
							<div class='badge badge-secondary badge-lg gap-2'>
								<span class='w-2 h-2 bg-secondary-content rounded-full'></span>
								WebSocket
							</div>
							<div class='badge badge-accent badge-lg gap-2'>
								<span class='w-2 h-2 bg-accent-content rounded-full'></span>
								FlyonUI
							</div>
							<div class='badge badge-success badge-lg gap-2'>
								<span class='w-2 h-2 bg-success-content rounded-full'></span>
								SolidJS
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class='grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto'>
				{/* REST API Testing */}
				<div class='space-y-6'>
					<div class='card bg-base-100 shadow-2xl border border-primary/10'>
						<div class='card-body'>
							<div class='flex items-center justify-between mb-6'>
								<div class='flex items-center gap-4'>
									<div class='w-14 h-14 bg-gradient-to-br from-primary to-primary-focus rounded-2xl flex items-center justify-center'>
										<span class='text-2xl'>📡</span>
									</div>
									<div>
										<h2 class='text-2xl font-bold'>
											REST API Testing
										</h2>
										<p class='text-base-content/60'>
											HTTP endpoint testing
										</p>
									</div>
								</div>
								<button
									class='btn btn-ghost btn-sm'
									onClick={clearResults}
									disabled={testResults().length === 0}
								>
									Clear Results
								</button>
							</div>

							<div class='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
								<button
									class='btn btn-primary btn-lg group hover:scale-105 transition-transform'
									onClick={() =>
										testEndpoint(
											'/api/hello',
											'GET',
											'Hello World API'
										)
									}
									disabled={activeTests().size > 0}
								>
									<Show
										when={activeTests().size > 0}
										fallback={
											<svg
												class='w-5 h-5 group-hover:rotate-12 transition-transform'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
											</svg>
										}
									>
										<span class='loading loading-spinner loading-sm'></span>
									</Show>
									Hello API
								</button>

								<button
									class='btn btn-success btn-lg group hover:scale-105 transition-transform'
									onClick={() =>
										testEndpoint(
											'/health',
											'GET',
											'Health Check'
										)
									}
									disabled={activeTests().size > 0}
								>
									<Show
										when={activeTests().size > 0}
										fallback={
											<svg
												class='w-5 h-5 group-hover:rotate-12 transition-transform'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path
													fill-rule='evenodd'
													d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
													clip-rule='evenodd'
												/>
											</svg>
										}
									>
										<span class='loading loading-spinner loading-sm'></span>
									</Show>
									Health
								</button>

								<button
									class='btn btn-accent btn-lg group hover:scale-105 transition-transform'
									onClick={() =>
										testEndpoint(
											'/',
											'GET',
											'Root Endpoint'
										)
									}
									disabled={activeTests().size > 0}
								>
									<Show
										when={activeTests().size > 0}
										fallback={
											<svg
												class='w-5 h-5 group-hover:rotate-12 transition-transform'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
											</svg>
										}
									>
										<span class='loading loading-spinner loading-sm'></span>
									</Show>
									Root
								</button>
							</div>

							{/* Test Results */}
							<div class='space-y-3 max-h-80 overflow-y-auto'>
								<For
									each={testResults()}
									fallback={
										<div class='text-center py-8 text-base-content/50'>
											<div class='text-4xl mb-2'>🎯</div>
											<p>
												Click a button to start testing
											</p>
										</div>
									}
								>
									{(result) => (
										<div
											class={`alert ${
												result.status === 'success'
													? 'alert-success'
													: result.status === 'error'
														? 'alert-error'
														: 'alert-info'
											} transition-all duration-300`}
										>
											<div class='flex items-center gap-3 w-full'>
												<div
													class={`w-3 h-3 rounded-full ${
														result.status ===
														'success'
															? 'bg-success'
															: result.status ===
																  'error'
																? 'bg-error'
																: 'bg-info animate-pulse'
													}`}
												></div>
												<div class='flex-1 min-w-0'>
													<div class='flex items-center justify-between mb-1'>
														<span class='font-medium'>
															{result.method}{' '}
															{result.endpoint}
														</span>
														<span class='text-xs opacity-70'>
															{result.timestamp}
														</span>
													</div>
													<Show
														when={
															result.status ===
															'success'
														}
													>
														<div class='flex items-center gap-4 text-sm'>
															<span class='badge badge-success badge-sm'>
																{
																	result.statusCode
																}
															</span>
															<span class='text-xs'>
																{
																	result.responseTime
																}
																ms
															</span>
														</div>
													</Show>
													<Show
														when={
															result.status ===
															'error'
														}
													>
														<p class='text-sm opacity-80'>
															{result.error ||
																'Request failed'}
														</p>
													</Show>
												</div>
												<Show when={result.data}>
													<details class='dropdown dropdown-end'>
														<summary class='btn btn-ghost btn-xs'>
															JSON
														</summary>
														<div class='dropdown-content z-[1] p-4 shadow-lg bg-base-200 rounded-box w-80'>
															<pre class='text-xs overflow-auto max-h-40'>
																{JSON.stringify(
																	result.data,
																	null,
																	2
																)}
															</pre>
														</div>
													</details>
												</Show>
											</div>
										</div>
									)}
								</For>
							</div>
						</div>
					</div>
				</div>

				{/* WebSocket Testing */}
				<div class='space-y-6'>
					<div class='card bg-base-100 shadow-2xl border border-secondary/10'>
						<div class='card-body'>
							<div class='flex items-center justify-between mb-6'>
								<div class='flex items-center gap-4'>
									<div class='w-14 h-14 bg-gradient-to-br from-secondary to-secondary-focus rounded-2xl flex items-center justify-center'>
										<span class='text-2xl'>🔌</span>
									</div>
									<div>
										<h2 class='text-2xl font-bold'>
											WebSocket Testing
										</h2>
										<p class='text-base-content/60'>
											Real-time communication
										</p>
									</div>
								</div>
								<div
									class={`badge gap-2 ${isConnected() ? 'badge-success' : 'badge-error'}`}
								>
									<div
										class={`w-2 h-2 rounded-full ${isConnected() ? 'bg-success animate-pulse' : 'bg-error'}`}
									></div>
									{isConnected()
										? 'Connected'
										: 'Disconnected'}
								</div>
							</div>

							{/* Connection Stats */}
							<Show when={isConnected()}>
								<div class='stats stats-horizontal shadow mb-6 w-full'>
									<div class='stat'>
										<div class='stat-title text-xs'>
											Messages
										</div>
										<div class='stat-value text-lg'>
											{connectionStats().totalMessages}
										</div>
									</div>
									<div class='stat'>
										<div class='stat-title text-xs'>
											Uptime
										</div>
										<div class='stat-value text-lg'>
											{connectionStats().uptime}
										</div>
									</div>
									<div class='stat'>
										<div class='stat-title text-xs'>
											Latency
										</div>
										<div class='stat-value text-lg'>
											{connectionStats().latency}ms
										</div>
									</div>
								</div>
							</Show>

							{/* Connection Controls */}
							<div class='flex gap-3 mb-6'>
								<Show
									when={!isConnected()}
									fallback={
										<button
											class='btn btn-error flex-1'
											onClick={disconnectWebSocket}
										>
											<svg
												class='w-5 h-5'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path
													fill-rule='evenodd'
													d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
													clip-rule='evenodd'
												/>
											</svg>
											Disconnect
										</button>
									}
								>
									<button
										class='btn btn-success flex-1'
										onClick={connectWebSocket}
										disabled={isConnecting()}
									>
										<Show
											when={isConnecting()}
											fallback={
												<svg
													class='w-5 h-5'
													fill='currentColor'
													viewBox='0 0 20 20'
												>
													<path
														fill-rule='evenodd'
														d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
														clip-rule='evenodd'
													/>
												</svg>
											}
										>
											<span class='loading loading-spinner loading-sm'></span>
										</Show>
										{isConnecting()
											? 'Connecting...'
											: 'Connect'}
									</button>
								</Show>
								<button
									class='btn btn-ghost'
									onClick={clearMessages}
									disabled={wsMessages().length === 0}
								>
									Clear
								</button>
							</div>

							{/* Message Input */}
							<Show when={isConnected()}>
								<div class='flex gap-3 mb-6'>
									<input
										type='text'
										class='input input-bordered flex-1'
										placeholder='Enter your message...'
										value={messageInput()}
										onInput={(e) =>
											setMessageInput(
												e.currentTarget.value
											)
										}
										onKeyPress={(e) =>
											e.key === 'Enter' && sendMessage()
										}
									/>
									<button
										class='btn btn-primary'
										onClick={sendMessage}
										disabled={!messageInput().trim()}
									>
										<svg
											class='w-5 h-5'
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z' />
										</svg>
										Send
									</button>
								</div>
							</Show>

							{/* Messages */}
							<div class='space-y-2 max-h-80 overflow-y-auto'>
								<For
									each={wsMessages()}
									fallback={
										<div class='text-center py-8 text-base-content/50'>
											<div class='text-4xl mb-2'>💬</div>
											<p>
												WebSocket messages will appear
												here
											</p>
										</div>
									}
								>
									{(message) => (
										<div
											class={`chat ${
												message.type === 'sent'
													? 'chat-end'
													: message.type ===
														  'received'
														? 'chat-start'
														: 'chat-start'
											}`}
										>
											<div class='chat-image avatar'>
												<div
													class={`w-10 rounded-full ${
														message.type === 'sent'
															? 'bg-primary'
															: message.type ===
																  'received'
																? 'bg-secondary'
																: 'bg-base-300'
													} flex items-center justify-center`}
												>
													<span class='text-xs'>
														{message.type === 'sent'
															? '👤'
															: message.type ===
																  'received'
																? '🤖'
																: '⚙️'}
													</span>
												</div>
											</div>
											<div class='chat-header'>
												<time class='text-xs opacity-50'>
													{message.timestamp}
												</time>
											</div>
											<div
												class={`chat-bubble ${
													message.type === 'sent'
														? 'chat-bubble-primary'
														: message.type ===
															  'received'
															? 'chat-bubble-secondary'
															: 'chat-bubble-accent'
												}`}
											>
												<div class='text-sm'>
													{message.message}
													<Show when={message.data}>
														<details class='mt-2'>
															<summary class='cursor-pointer text-xs opacity-70'>
																View Data
															</summary>
															<pre class='text-xs mt-1 overflow-auto'>
																{JSON.stringify(
																	message.data,
																	null,
																	2
																)}
															</pre>
														</details>
													</Show>
												</div>
											</div>
										</div>
									)}
								</For>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div class='text-center mt-12 p-6'>
				<div class='divider'>Tech Stack</div>
				<div class='flex flex-wrap justify-center gap-4 text-sm text-base-content/60'>
					<span>🚀 Elysia v1.3.5</span>
					<span>⚛️ SolidJS v1.9.5</span>
					<span>🎨 FlyonUI v2.3.1</span>
					<span>🌈 Tailwind CSS v4.0.17</span>
					<span>⚡ Vite v7.0.5</span>
					<span>🟨 Bun Runtime</span>
				</div>
			</div>
		</div>
	);
};

export default ApiTest;
