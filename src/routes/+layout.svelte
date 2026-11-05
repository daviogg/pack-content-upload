<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Only "Resources" is implemented; the other entries mirror the design.
	const nav = [
		'Dashboard',
		'Users',
		'Feedbacks',
		'Programs',
		'Resources',
		'Counterparties',
		'Events'
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Pack · Resources</title>
</svelte:head>

<header class="border-b border-line bg-white">
	<div class="mx-auto flex h-16 max-w-7xl items-center gap-10 px-6">
		<a href={resolve('/')} class="text-3xl font-black tracking-tight text-ink">
			p<span class="text-brand">a</span>ck
		</a>
		<nav class="flex h-full items-center gap-8 text-lg font-semibold text-muted">
			{#each nav as item (item)}
				{#if item === 'Resources'}
					<a href={resolve('/')} class="flex h-16 items-center border-b-2 border-brand text-brand"
						>{item}</a
					>
				{:else}
					<span class="cursor-default">{item}</span>
				{/if}
			{/each}
		</nav>
	</div>
</header>

<main class="mx-auto max-w-7xl px-6 py-8">
	{@render children()}
</main>
