<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Admin · Pack</title>
</svelte:head>

<section class="mx-auto mt-8 max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm">
	<h1 class="text-2xl font-semibold">Admin login</h1>
	<p class="mt-2 text-muted">Administrators can delete resources.</p>

	{#if data.configured}
		<form method="POST" action="?/login" use:enhance class="mt-6 space-y-4">
			<input
				type="password"
				name="password"
				placeholder="Password"
				required
				autocomplete="current-password"
				class="w-full rounded-lg border-line text-base placeholder:text-muted/60 focus:border-brand focus:ring-brand {form
					? 'border-red-500'
					: ''}"
			/>
			{#if form}
				<p class="text-sm text-red-600" role="alert">{form.message}</p>
			{/if}
			<button
				type="submit"
				class="w-full rounded-lg bg-brand px-6 py-2.5 text-lg font-bold text-white hover:bg-brand-dark"
			>
				Log in
			</button>
		</form>
	{:else}
		<p class="mt-6 rounded-lg bg-surface px-4 py-3 text-muted" role="alert">
			No administrator is configured. Set <code>ADMIN_PASSWORD</code> to enable this page.
		</p>
	{/if}
</section>
