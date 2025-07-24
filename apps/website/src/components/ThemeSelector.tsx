import { Component, createSignal, For, onMount } from 'solid-js';

const themes = [
	{ name: 'light', icon: '🌞' },
	{ name: 'dark', icon: '🌚' },
	{ name: 'black', icon: '⚫️' },
];

const ThemeSelector: Component = () => {
	return (
		<div class='dropdown relative inline-flex [--auto-close:inside]'>
			<button
				id='dropdown-default'
				type='button'
				class='dropdown-toggle btn btn-outline btn-primary'
				aria-haspopup='menu'
				aria-expanded='false'
				aria-label='Dropdown'
			>
				Themes
				<span class='icon-[tabler--chevron-down] dropdown-open:rotate-180 size-4'></span>
			</button>
			<ul
				class='dropdown-menu dropdown-open:opacity-100 hidden min-w-60'
				role='menu'
				aria-orientation='vertical'
				aria-labelledby='dropdown-default'
			>
				<For each={themes}>
					{(theme) => (
						<li>
							<input
								type='radio'
								name='theme-dropdown'
								class='theme-controller btn btn-text w-full justify-start'
								aria-label={
									theme.icon
										? `${theme.icon} ${theme.name}`
										: theme.name
								}
								value={theme.name}
								checked={theme.name === 'default'}
							/>
						</li>
					)}
				</For>
			</ul>
		</div>
	);
};

export default ThemeSelector;
