import type { PageServerLoad } from './$types';
import { container } from '#lib/infrastructure/container.ts';
import { findTab } from '#lib/ui/tabs.ts';

/**
 * Resources list. Tab and search live in the URL (?tab=videos&q=conflict)
 * so the page is shareable and works without client-side JavaScript.
 */
export const load: PageServerLoad = async ({ url }) => {
	const tab = findTab(url.searchParams.get('tab'));
	const search = url.searchParams.get('q') ?? '';

	const resources = await container.listResources.execute({
		kinds: [...tab.kinds],
		search
	});

	return { resources, tab: tab.id, search };
};
