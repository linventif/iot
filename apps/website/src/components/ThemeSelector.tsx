import { Component, createSignal, onMount } from 'solid-js';

const themes = [
	'light',
	'dark',
	'cupcake',
	'bumblebee',
	'emerald',
	'corporate',
	'synthwave',
	'retro',
	'cyberpunk',
	'valentine',
	'halloween',
	'garden',
	'forest',
	'aqua',
	'lofi',
	'pastel',
	'fantasy',
	'wireframe',
	'black',
	'luxury',
	'dracula',
	'cmyk',
	'autumn',
	'business',
	'acid',
	'lemonade',
	'night',
	'coffee',
	'winter',
	'dim',
	'nord',
	'sunset',
];

const ThemeSelector: Component = () => {
	const [currentTheme, setCurrentTheme] = createSignal('black');

	onMount(() => {
		const savedTheme = localStorage.getItem('theme') || 'black';
		setCurrentTheme(savedTheme);
		document.documentElement.setAttribute('data-theme', savedTheme);
	});

	const changeTheme = (theme: string) => {
		setCurrentTheme(theme);
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	};

	return (
		<div class='dropdown dropdown-end'>
			<div tabindex='0' role='button' class='btn btn-ghost gap-2'>
				<svg
					width='20'
					height='20'
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						stroke-linecap='round'
						stroke-linejoin='round'
						stroke-width='2'
						d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z'
					/>
				</svg>
				Theme
				<svg
					width='12px'
					height='12px'
					class='ml-1 opacity-60'
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					stroke-width='2'
					stroke-linecap='round'
					stroke-linejoin='round'
				>
					<polyline points='6,9 12,15 18,9'></polyline>
				</svg>
			</div>
			<ul
				tabindex='0'
				class='dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow-2xl max-h-96 overflow-y-auto'
			>
				{themes.map((theme) => (
					<li>
						<button
							class={`capitalize ${currentTheme() === theme ? 'active' : ''}`}
							onClick={() => changeTheme(theme)}
						>
							<span class='flex-1 text-left'>{theme}</span>
							{currentTheme() === theme && (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='currentColor'
									class='w-4 h-4'
								>
									<path d='M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z' />
								</svg>
							)}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ThemeSelector;
