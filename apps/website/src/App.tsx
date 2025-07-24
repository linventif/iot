import { Route, Router, useLocation } from '@solidjs/router';
import { createEffect, createSignal, JSX } from 'solid-js';
import { render } from 'solid-js/web';

import Home from './pages/Home';
import ApiTest from './pages/ApiTest';
import NotFound from './pages/NotFound';

async function loadFlyonUI() {
	return import('flyonui/flyonui');
}

interface AppProps {
	children?: JSX.Element;
}

const App = (props: AppProps) => {
	const location = useLocation();
	const [_, setLoc] = createSignal(location.pathname);

	createEffect(() => {
		const initFlyonUI = async () => {
			await loadFlyonUI();
		};

		initFlyonUI();
	});

	createEffect(() => {
		setLoc(location.pathname);

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
		<div class='min-h-screen flex justify-center'>
			<div class='p-6'>{props.children}</div>
		</div>
	);
};

render(
	() => (
		<Router root={App}>
			<Route path='/' component={Home} />
			<Route path='/api-test' component={ApiTest} />
			<Route path='*404' component={NotFound} />
		</Router>
	),
	document.getElementById('root') as HTMLElement
);

export default App;
