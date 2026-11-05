import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DomainError } from '#lib/domain/shared/DomainError.ts';
import { container } from '#lib/infrastructure/container.ts';

/** Resource detail. Opening the page counts as a view (ViewResource). */
export const load: PageServerLoad = async ({ params }) => {
	let resource;
	try {
		resource = await container.viewResource.execute(params.id);
	} catch (e) {
		if (e instanceof DomainError) error(400, e.message);
		throw e;
	}
	if (!resource) error(404, 'Resource not found');

	return { resource };
};
