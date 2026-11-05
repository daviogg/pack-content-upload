<script lang="ts">
	import type { ResourceSummary } from '../application/dto/ResourceSummary';

	let { resources }: { resources: ResourceSummary[] } = $props();

	const KIND_LABEL: Record<ResourceSummary['file']['kind'], string> = {
		pdf: 'PDF',
		video: 'Video',
		text: 'Text',
		slides: 'Slides',
		image: 'Image'
	};
</script>

{#if resources.length === 0}
	<p class="px-4 py-16 text-center text-muted">No resources yet. Upload the first one.</p>
{:else}
	<table class="w-full text-left text-[15px]">
		<thead class="text-sm font-bold text-ink">
			<tr class="border-b border-line">
				<th class="px-4 py-4">Content Title</th>
				<th class="px-4 py-4">Category</th>
				<th class="px-4 py-4">Language</th>
				<th class="px-4 py-4">Roles</th>
				<th class="px-4 py-4">View Count</th>
				<th class="px-4 py-4">Provider</th>
				<th class="px-4 py-4">Type</th>
			</tr>
		</thead>
		<tbody>
			{#each resources as r (r.id)}
				<tr class="border-b border-line transition hover:bg-surface">
					<td class="px-4 py-4 font-medium">
						<!-- A real <a> keeps the row keyboard-accessible. Typed resolve() lands with the route (detail page). -->
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href="/resources/{r.id}" class="block">{r.title}</a>
					</td>
					<td class="px-4 py-4">{r.category.label}</td>
					<td class="px-4 py-4">{r.language.label}</td>
					<td class="px-4 py-4">{r.roles.map((role) => role.label).join(', ')}</td>
					<td class="px-4 py-4 tabular-nums">{r.viewCount}</td>
					<td class="px-4 py-4">
						<span class="rounded-full bg-surface px-3 py-1 text-sm">{r.provider.label}</span>
					</td>
					<td class="px-4 py-4">
						<span class="rounded-full bg-surface px-3 py-1 text-sm">{KIND_LABEL[r.file.kind]}</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
