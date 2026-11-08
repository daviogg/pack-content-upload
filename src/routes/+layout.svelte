<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

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
	<div class="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 md:gap-10">
		<a href={resolve('/')} class="text-3xl font-black tracking-tight text-ink">
			p<span class="text-brand">a</span>ck
		</a>
		<!-- Scrolls sideways on narrow screens instead of overflowing the page -->
		<nav
			class="flex h-full items-center gap-6 overflow-x-auto text-lg font-semibold whitespace-nowrap text-muted md:gap-8"
		>
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
		<!-- Admin entry point: a login link, or a logout form once the signed cookie is set -->
		{#if data.isAdmin}
			<form method="POST" action="{resolve('/admin')}?/logout" use:enhance class="ml-auto shrink-0">
				<button type="submit" class="text-sm font-semibold text-muted hover:text-ink"
					>Log out</button
				>
			</form>
		{:else}
			<a
				href={resolve('/admin')}
				class="ml-auto shrink-0 text-sm font-semibold text-muted hover:text-ink">Admin</a
			>
		{/if}
	</div>
</header>

<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
	{@render children()}
</main>
