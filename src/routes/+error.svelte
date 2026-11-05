<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	// Deterministic star positions so server and client render the same markup.
	const stars = Array.from({ length: 28 }, (_, i) => ({
		x: (i * 37) % 100,
		y: (i * 53) % 100,
		size: 6 + (i % 3) * 4,
		delay: (i % 7) * 0.4
	}));

	const title = $derived(
		page.status === 404 ? 'Resource not found' : (page.error?.message ?? 'Something went wrong')
	);
	const caption = $derived(
		page.status === 404
			? 'The cats looked everywhere. Even under the couch.'
			: 'The cats knocked something off the table.'
	);
</script>

<svelte:head>
	<title>{page.status} · Pack</title>
</svelte:head>

<section class="relative overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
	{#each stars as star, i (i)}
		<span
			class="star"
			style="left:{star.x}%; top:{star.y}%; --size:{star.size}px; --delay:{star.delay}s"
			aria-hidden="true">✦</span
		>
	{/each}

	<div class="relative px-6 py-20 text-center">
		<div class="flex items-end justify-center gap-10">
			<svg
				viewBox="0 0 16 14"
				width="96"
				height="84"
				shape-rendering="crispEdges"
				aria-hidden="true"
				class="cat"
			>
				<rect x="2" y="0" width="2" height="2" fill="#1f2430" />
				<rect x="10" y="0" width="2" height="2" fill="#1f2430" />
				<rect x="3" y="1" width="1" height="1" fill="#f5873a" />
				<rect x="11" y="1" width="1" height="1" fill="#f5873a" />
				<rect x="2" y="2" width="10" height="7" fill="#1f2430" />
				<rect x="4" y="4" width="2" height="2" fill="#fff" />
				<rect x="8" y="4" width="2" height="2" fill="#fff" />
				<rect x="5" y="5" width="1" height="1" fill="#1f2430" />
				<rect x="9" y="5" width="1" height="1" fill="#1f2430" />
				<rect x="6" y="7" width="2" height="1" fill="#f5873a" />
				<rect x="3" y="9" width="8" height="4" fill="#1f2430" />
				<rect x="11" y="10" width="3" height="1" fill="#1f2430" />
				<rect x="13" y="8" width="1" height="2" fill="#1f2430" />
				<rect x="3" y="13" width="2" height="1" fill="#1f2430" />
				<rect x="9" y="13" width="2" height="1" fill="#1f2430" />
			</svg>

			<p class="code" aria-label="Error {page.status}">{page.status}</p>

			<svg
				viewBox="0 0 16 14"
				width="96"
				height="84"
				shape-rendering="crispEdges"
				aria-hidden="true"
				class="cat cat-2"
			>
				<rect x="2" y="0" width="2" height="2" fill="#f5873a" />
				<rect x="10" y="0" width="2" height="2" fill="#f5873a" />
				<rect x="2" y="2" width="10" height="7" fill="#f5873a" />
				<rect x="4" y="4" width="2" height="2" fill="#fff" />
				<rect x="8" y="4" width="2" height="2" fill="#fff" />
				<rect x="4" y="5" width="1" height="1" fill="#1f2430" />
				<rect x="8" y="5" width="1" height="1" fill="#1f2430" />
				<rect x="6" y="7" width="2" height="1" fill="#1f2430" />
				<rect x="3" y="9" width="8" height="4" fill="#f5873a" />
				<rect x="0" y="10" width="3" height="1" fill="#f5873a" />
				<rect x="0" y="8" width="1" height="2" fill="#f5873a" />
				<rect x="3" y="13" width="2" height="1" fill="#f5873a" />
				<rect x="9" y="13" width="2" height="1" fill="#f5873a" />
			</svg>
		</div>

		<h1 class="mt-8 text-2xl font-semibold">{title}</h1>
		<p class="mt-3 text-muted">{caption}</p>

		<a
			href={resolve('/')}
			class="mt-8 inline-block rounded-lg bg-brand px-6 py-2.5 text-lg font-bold text-white hover:bg-brand-dark"
		>
			&larr; Back to Resources
		</a>
	</div>
</section>

<style>
	.code {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 7rem;
		line-height: 1;
		font-weight: 800;
		color: var(--color-ink);
		letter-spacing: -0.04em;
		/* stepped "8-bit" shadow in brand orange */
		text-shadow:
			4px 4px 0 var(--color-brand),
			8px 8px 0 rgba(245, 135, 58, 0.35);
	}

	.star {
		position: absolute;
		font-size: var(--size);
		color: var(--color-brand);
		opacity: 0.25;
		animation: twinkle 2.4s ease-in-out infinite;
		animation-delay: var(--delay);
		user-select: none;
		pointer-events: none;
	}

	.cat {
		animation: bob 1.6s ease-in-out infinite;
	}
	.cat-2 {
		animation-delay: 0.8s;
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.15;
			transform: scale(0.8);
		}
		50% {
			opacity: 0.9;
			transform: scale(1.15);
		}
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.star,
		.cat {
			animation: none;
		}
	}
</style>
