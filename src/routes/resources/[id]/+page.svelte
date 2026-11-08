<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import ResourceViewer from '#lib/ui/ResourceViewer.svelte';

	let { data }: PageProps = $props();
	const r = $derived(data.resource);

	const fileUrl = $derived(resolve('/files/[id]', { id: r.id }));
	const downloadUrl = $derived(resolve('/files/[id]?download=1', { id: r.id }));

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

<svelte:head>
	<title>{r.title} · Pack</title>
</svelte:head>

<a href={resolve('/')} class="text-muted hover:text-ink">&larr; Resources</a>

<section class="mt-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8">
	<div class="flex flex-wrap items-start justify-between gap-6">
		<div class="max-w-3xl">
			<h1 class="text-2xl font-semibold break-words sm:text-3xl">{r.title}</h1>
			<p class="mt-3 text-lg text-muted">{r.description}</p>
		</div>
		<div class="flex gap-3">
			<a
				href={fileUrl}
				target="_blank"
				rel="noopener"
				class="rounded-lg border border-line px-5 py-2.5 font-bold hover:bg-surface"
			>
				Open
			</a>
			<a
				href={downloadUrl}
				class="rounded-lg bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark"
			>
				Download
			</a>
			{#if data.isAdmin}
				<!-- Shown to admins only; the action re-checks the session server-side -->
				<form
					method="POST"
					action="?/delete"
					use:enhance={({ cancel }) => {
						if (!confirm(`Delete “${r.title}”? This cannot be undone.`)) cancel();
					}}
				>
					<button
						type="submit"
						class="rounded-lg border border-red-300 px-5 py-2.5 font-bold text-red-600 hover:bg-red-50"
					>
						Delete
					</button>
				</form>
			{/if}
		</div>
	</div>

	<dl class="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 text-[15px] sm:grid-cols-3 lg:grid-cols-6">
		<div>
			<dt class="text-sm text-muted">Category</dt>
			<dd>{r.category.label}</dd>
		</div>
		<div>
			<dt class="text-sm text-muted">Language</dt>
			<dd>{r.language.label}</dd>
		</div>
		<div>
			<dt class="text-sm text-muted">Provider</dt>
			<dd>{r.provider.label}</dd>
		</div>
		<div>
			<dt class="text-sm text-muted">Roles</dt>
			<dd>{r.roles.map((role) => role.label).join(', ')}</dd>
		</div>
		<div>
			<dt class="text-sm text-muted">View Count</dt>
			<dd>{r.viewCount}</dd>
		</div>
		<div>
			<dt class="text-sm text-muted">File</dt>
			<dd>{r.file.originalName} · {formatSize(r.file.sizeBytes)}</dd>
		</div>
	</dl>

	<div class="mt-8">
		<ResourceViewer resourceId={r.id} file={r.file} />
	</div>
</section>
