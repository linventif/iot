import { Component } from 'solid-js';

const NotFound: Component = () => {
	return (
		<div class='min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200/50 p-6'>
			<div class='text-center max-w-2xl'>
				{/* 404 Animation */}
				<div class='relative mb-8'>
					<div class='text-9xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse'>
						404
					</div>
					<div class='absolute inset-0 flex items-center justify-center'>
						<div class='w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full animate-ping'></div>
					</div>
				</div>

				{/* Error Message */}
				<div class='space-y-6 mb-8'>
					<h1 class='text-4xl font-bold text-base-content'>
						Oops! Page Not Found
					</h1>
					<p class='text-xl text-base-content/70'>
						The page you're looking for seems to have taken a detour
						into the digital void.
					</p>
				</div>

				{/* Visual Elements */}
				<div class='flex justify-center mb-8'>
					<div class='grid grid-cols-3 gap-4'>
						<div
							class='w-16 h-16 bg-gradient-to-br from-primary to-primary-focus rounded-2xl flex items-center justify-center animate-bounce'
							style='animation-delay: 0ms'
						>
							<span class='text-2xl'>🏊</span>
						</div>
						<div
							class='w-16 h-16 bg-gradient-to-br from-secondary to-secondary-focus rounded-2xl flex items-center justify-center animate-bounce'
							style='animation-delay: 150ms'
						>
							<span class='text-2xl'>🔍</span>
						</div>
						<div
							class='w-16 h-16 bg-gradient-to-br from-accent to-accent-focus rounded-2xl flex items-center justify-center animate-bounce'
							style='animation-delay: 300ms'
						>
							<span class='text-2xl'>❓</span>
						</div>
					</div>
				</div>

				{/* Action Cards */}
				<div class='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
					<div class='card bg-base-100 shadow-xl border border-primary/10 hover:shadow-2xl transition-all duration-300 hover:scale-105'>
						<div class='card-body text-center'>
							<div class='w-12 h-12 bg-gradient-to-br from-primary to-primary-focus rounded-xl flex items-center justify-center mx-auto mb-4'>
								<svg
									class='w-6 h-6 text-primary-content'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
								</svg>
							</div>
							<h3 class='card-title text-lg justify-center mb-2'>
								Go Home
							</h3>
							<p class='text-base-content/60 mb-4'>
								Return to the main dashboard
							</p>
							<a href='/' class='btn btn-primary'>
								<svg
									class='w-4 h-4'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path
										fill-rule='evenodd'
										d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
										clip-rule='evenodd'
									/>
								</svg>
								Take Me Home
							</a>
						</div>
					</div>

					<div class='card bg-base-100 shadow-xl border border-secondary/10 hover:shadow-2xl transition-all duration-300 hover:scale-105'>
						<div class='card-body text-center'>
							<div class='w-12 h-12 bg-gradient-to-br from-secondary to-secondary-focus rounded-xl flex items-center justify-center mx-auto mb-4'>
								<svg
									class='w-6 h-6 text-secondary-content'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
								</svg>
							</div>
							<h3 class='card-title text-lg justify-center mb-2'>
								Test API
							</h3>
							<p class='text-base-content/60 mb-4'>
								Try our API testing dashboard
							</p>
							<a href='/api-test' class='btn btn-secondary'>
								<svg
									class='w-4 h-4'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z' />
								</svg>
								Start Testing
							</a>
						</div>
					</div>
				</div>

				{/* Fun Facts */}
				<div class='alert alert-info'>
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
						></path>
					</svg>
					<div class='text-left'>
						<h4 class='font-semibold'>Did you know?</h4>
						<p class='text-sm'>
							The first 404 error was created in 1993 at CERN.
							You've just experienced a piece of internet history!
							🌐
						</p>
					</div>
				</div>

				{/* Floating Elements */}
				<div class='absolute top-20 left-10 opacity-20 animate-float'>
					<div class='w-8 h-8 bg-primary rounded-full'></div>
				</div>
				<div
					class='absolute top-40 right-20 opacity-20 animate-float'
					style='animation-delay: 1s'
				>
					<div class='w-6 h-6 bg-secondary rounded-full'></div>
				</div>
				<div
					class='absolute bottom-40 left-20 opacity-20 animate-float'
					style='animation-delay: 2s'
				>
					<div class='w-10 h-10 bg-accent rounded-full'></div>
				</div>
			</div>

			{/* Custom Styles */}
			<style>{`
				@keyframes float {
					0%, 100% { transform: translateY(0px) rotate(0deg); }
					33% { transform: translateY(-10px) rotate(120deg); }
					66% { transform: translateY(5px) rotate(240deg); }
				}
				.animate-float {
					animation: float 6s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
};

export default NotFound;
