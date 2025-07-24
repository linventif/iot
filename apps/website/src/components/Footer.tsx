import ThemeSelector from './ThemeSelector';

export default function Footer() {
	return (
		<footer class='w-full mt-12 border-t border-base-300 bg-base-100/80 py-6'>
			<div class='flex items-center gap-4 justify-center'>
				<ThemeSelector />
			</div>
		</footer>
	);
}
