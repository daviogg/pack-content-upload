<script lang="ts">
	import type { PageProps } from './$types';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import UploadModal from '#lib/ui/UploadModal.svelte';
	import { TABS } from '#lib/ui/tabs.ts';
	import { resolve } from '$app/paths';

	let { data, form }: PageProps = $props();

	// Open when asked via the URL, or when a failed submit has something to show.
	const uploadOpen = $derived(data.uploadOpen || form !== null);
</script>

<section class="relative rounded-2xl border border-line bg-white shadow-sm">
	{#if data.justUploaded}
		<div
			role="status"
			class="absolute top-0 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-b-xl bg-white px-5 py-3 shadow-lg"
		>
			<span
				class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm text-white"
				>✓</span
			>
			<span>Resource Uploaded Successfully!</span>
		</div>
	{/if}

	<!-- Tabs and search/upload stack on small screens, share one row from sm up -->
	<div
		class="flex flex-col gap-4 border-b border-line px-4 pt-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6"
	>
		<nav class="flex gap-6 overflow-x-auto text-lg whitespace-nowrap sm:gap-7">
			{#each TABS as tab (tab.id)}
				<a
					href={resolve(
						`/?tab=${tab.id}${data.search ? `&q=${encodeURIComponent(data.search)}` : ''}`
					)}
					class="-mb-px border-b-2 pb-3 {data.tab === tab.id
						? 'border-ink text-ink'
						: 'border-transparent text-muted hover:text-ink'}"
				>
					{tab.label}
				</a>
			{/each}
			<span class="pb-3 text-muted/50">Archive</span>
		</nav>

		<form method="GET" class="flex items-center gap-3 pb-4 sm:ml-auto sm:gap-4 sm:pb-3">
			<input type="hidden" name="tab" value={data.tab} />
			<input
				type="search"
				name="q"
				value={data.search}
				placeholder="Field"
				class="w-full min-w-0 rounded-lg border-line text-base placeholder:text-muted/60 focus:border-brand focus:ring-brand sm:w-72"
			/>
			<a
				href={resolve('/?upload=1')}
				class="shrink-0 rounded-lg bg-brand px-6 py-2.5 text-lg font-bold text-white hover:bg-brand-dark"
			>
				Upload
			</a>
		</form>
	</div>

	<ResourceTable resources={data.resources} />
</section>

{#if uploadOpen}
	<UploadModal options={data.options} values={form?.values} error={form?.error} />
{/if}
