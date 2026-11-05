<script lang="ts">
	import type { ResourceSummary } from '../application/dto/ResourceSummary';
	import { resolve } from '$app/paths';

	/** In-platform preview, chosen by the file kind the domain derived from the mime type. */
	let { resourceId, file }: { resourceId: string; file: ResourceSummary['file'] } = $props();

	const fileUrl = $derived(resolve('/files/[id]', { id: resourceId }));
	const downloadUrl = $derived(resolve('/files/[id]?download=1', { id: resourceId }));
</script>

<div class="overflow-hidden rounded-xl border border-line bg-surface">
	{#if file.kind === 'pdf' || file.kind === 'text'}
		<iframe src={fileUrl} title={file.originalName} class="h-[70vh] w-full bg-white"></iframe>
	{:else if file.kind === 'video'}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video src={fileUrl} controls class="max-h-[70vh] w-full bg-black"></video>
	{:else if file.kind === 'image'}
		<img src={fileUrl} alt={file.originalName} class="mx-auto max-h-[70vh]" />
	{:else}
		<div class="flex flex-col items-center gap-4 px-6 py-16 text-center">
			<p class="text-muted">Preview is not available for this file type.</p>
			<a
				href={downloadUrl}
				class="rounded-lg bg-brand px-6 py-2.5 text-lg font-bold text-white hover:bg-brand-dark"
			>
				Download {file.originalName}
			</a>
		</div>
	{/if}
</div>
