import { Route, Router } from '@solidjs/router';
import { createEffect, JSX } from 'solid-js';
import { render } from 'solid-js/web';

import Home from './pages/Home';
import ApiTest from './pages/ApiTest';
import NotFound from './pages/NotFound';
import PoolDashboard from './components/PoolDashboard';

async function loadFlyonUI() {
	return import('flyonui/flyonui');
}

interface AppProps {
	children?: JSX.Element;
}

const App = (props: AppProps) => {
	createEffect(() => {
		const initFlyonUI = async () => {
			await loadFlyonUI();
		};

		initFlyonUI();
	});

	createEffect(() => {
		setTimeout(() => {
			if (
				window.HSStaticMethods &&
				typeof window.HSStaticMethods.autoInit === 'function'
			) {
				window.HSStaticMethods.autoInit();
			}
		}, 100);
	});

	return (
		<div class='min-h-screen bg-base-200'>
			<PoolDashboard />
			<div class='p-6'>{props.children}</div>
		</div>
	);
};

render(
	() => (
		<Router root={App}>
			<Route path='/' component={Home} />
			<Route path='/test' component={ApiTest} />
			<Route path='*404' component={NotFound} />
		</Router>
	),
	document.getElementById('root') as HTMLElement
);

export default App;
