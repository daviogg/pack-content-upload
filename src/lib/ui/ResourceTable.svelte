<script lang="ts">
	import type { ResourceSummary } from '../application/dto/ResourceSummary';
	import { resolve } from '$app/paths';

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
	<!-- Secondary columns appear as the screen grows: sm adds Language, md adds Roles, views and provider -->
	<table class="w-full text-left text-[15px]">
		<thead class="text-sm font-bold text-ink">
			<tr class="border-b border-line">
				<th class="px-4 py-4">Content Title</th>
				<th class="px-4 py-4">Category</th>
				<th class="hidden px-4 py-4 sm:table-cell">Language</th>
				<th class="hidden px-4 py-4 md:table-cell">Roles</th>
				<th class="hidden px-4 py-4 md:table-cell">View Count</th>
				<th class="hidden px-4 py-4 md:table-cell">Provider</th>
				<th class="px-4 py-4">Type</th>
			</tr>
		</thead>
		<tbody>
			{#each resources as r (r.id)}
				<tr class="border-b border-line transition hover:bg-surface">
					<td class="px-4 py-4 font-medium">
						<!-- A real <a> keeps the row keyboard-accessible (tab, middle-click, no JS needed). -->
						<a href={resolve('/resources/[id]', { id: r.id })} class="block">{r.title}</a>
					</td>
					<td class="px-4 py-4">{r.category.label}</td>
					<td class="hidden px-4 py-4 sm:table-cell">{r.language.label}</td>
					<td class="hidden px-4 py-4 md:table-cell"
						>{r.roles.map((role) => role.label).join(', ')}</td
					>
					<td class="hidden px-4 py-4 tabular-nums md:table-cell">{r.viewCount}</td>
					<td class="hidden px-4 py-4 md:table-cell">
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
