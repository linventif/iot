import { A } from '@solidjs/router';

const Home = () => (
	<div class='card flex sm:flex-row gap-4 size-fit p-8'>
		<div class='max-w-2xl'>
			<h1 class='text-4xl font-bold text-base-content mb-4'>
				Available Monitors
			</h1>
			<div class='grid gap-6'>
				<A
					href='/monitor/pool'
					class='card bg-blue-500 text-white shadow-xl hover:scale-105 transition-transform'
				>
					<div class='card-body flex flex-row items-center gap-4'>
						<span class='text-5xl'>🏊‍♂️</span>
						<div>
							<h2 class='card-title text-2xl'>Pool Monitor</h2>
							<p class='opacity-80'>
								View real-time pool status and control
							</p>
						</div>
					</div>
				</A>
			</div>
		</div>
	</div>
);

export default Home;
