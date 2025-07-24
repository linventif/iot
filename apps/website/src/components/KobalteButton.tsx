import { Component } from 'solid-js';
import { Button } from '@kobalte/core';

interface KobalteButtonProps {
	children: any;
	onClick?: () => void;
	disabled?: boolean;
	variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error';
	size?: 'sm' | 'md' | 'lg';
	loading?: boolean;
}

const KobalteButton: Component<KobalteButtonProps> = (props) => {
	const variantClasses = () => {
		switch (props.variant) {
			case 'primary':
				return 'btn-primary';
			case 'secondary':
				return 'btn-secondary';
			case 'accent':
				return 'btn-accent';
			case 'success':
				return 'btn-success';
			case 'error':
				return 'btn-error';
			default:
				return 'btn-primary';
		}
	};

	const sizeClasses = () => {
		switch (props.size) {
			case 'sm':
				return 'btn-sm';
			case 'lg':
				return 'btn-lg';
			default:
				return 'btn-md';
		}
	};

	return (
		<Button.Root
			class={`btn ${variantClasses()} ${sizeClasses()} gap-2`}
			onClick={props.onClick}
			disabled={props.disabled || props.loading}
		>
			{props.loading && (
				<span class='loading loading-spinner loading-sm'></span>
			)}
			{props.children}
		</Button.Root>
	);
};

export default KobalteButton;
