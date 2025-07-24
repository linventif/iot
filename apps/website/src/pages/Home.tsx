const Card = () => {
	return (
		<div class='card flex sm:flex-row gap-4 size-fit p-8'>
			<img
				src='https://cdn.flyonui.com/fy-assets/icons/solidjs-icon.png'
				alt='Solidjs logo'
				class='size-40'
			/>
			<div class='max-w-2xl'>
				<h2 class='text-3xl font-semibold text-info mb-3'>
					You did it! 🎉
				</h2>
				<p>
					You’ve successfully created a project with{' '}
					<a
						class='link link-animated text-info font-semibold'
						href='https://flyonui.com/'
					>
						FlyonUI
					</a>
					+
					<a
						class='link link-animated text-info font-semibold'
						href='https://www.solidjs.com/'
					>
						SolidJS
					</a>
				</p>
				<p class='text-base text-base-content'>
					Explore our pre-built components by navigating the menu.
					Test them with various themes from the navbar, and feel free
					to copy and paste any component to see it in action!
				</p>
				<p class='mt-2'>
					This example includes reusable Button and Accordion
					components. You can leverage these to build any custom
					component using FlyonUI, tailored to your specific
					requirements.
				</p>
			</div>
			<div class='dropdown relative inline-flex [--auto-close:inside]'>
				<button
					id='dropdown-default'
					type='button'
					class='dropdown-toggle btn btn-primary'
					aria-haspopup='menu'
					aria-expanded='false'
					aria-label='Dropdown'
				>
					Dropdown
					<span class='icon-[tabler--chevron-down] dropdown-open:rotate-180 size-4'></span>
				</button>
				<ul
					class='dropdown-menu dropdown-open:opacity-100 hidden min-w-60'
					role='menu'
					aria-orientation='vertical'
					aria-labelledby='dropdown-default'
				>
					<li>
						<input
							type='radio'
							name='theme-dropdown'
							class='theme-controller btn btn-text w-full justify-start'
							aria-label='Default'
							value='default'
							checked
						/>
					</li>
					<li>
						<input
							type='radio'
							name='theme-dropdown'
							class='theme-controller btn btn-text w-full justify-start'
							aria-label='Dark'
							value='dark'
						/>
					</li>
					<li>
						<input
							type='radio'
							name='theme-dropdown'
							class='theme-controller btn btn-text w-full justify-start'
							aria-label='black'
							value='black'
						/>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Card;
