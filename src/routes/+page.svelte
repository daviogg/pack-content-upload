<script lang="ts">
	import type { PageProps } from './$types';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import { TABS } from '#lib/ui/tabs.ts';
	import { resolve } from '$app/paths';

	let { data }: PageProps = $props();
</script>

<section class="rounded-2xl border border-line bg-white shadow-sm">
	<div class="flex items-center gap-6 border-b border-line px-6 pt-5">
		<nav class="flex gap-7 text-lg">
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

		<form method="GET" class="ml-auto flex items-center gap-4 pb-3">
			<input type="hidden" name="tab" value={data.tab} />
			<input
				type="search"
				name="q"
				value={data.search}
				placeholder="Field"
				class="w-72 rounded-lg border-line text-base placeholder:text-muted/60 focus:border-brand focus:ring-brand"
			/>
			<a
				href={resolve('/?upload=1')}
				class="rounded-lg bg-brand px-6 py-2.5 text-lg font-bold text-white hover:bg-brand-dark"
			>
				Upload
			</a>
		</form>
	</div>

	<ResourceTable resources={data.resources} />
</section>
