import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
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

export const actions: Actions = {
	/** Admin only: the server checks the cookie again, the hidden button is not the guard. */
	delete: async ({ params, locals }) => {
		if (!locals.isAdmin) error(403, 'Only an administrator can delete resources');

		let deleted;
		try {
			deleted = await container.deleteResource.execute(params.id);
		} catch (e) {
			if (e instanceof DomainError) error(400, e.message);
			throw e;
		}
		if (!deleted) error(404, 'Resource not found');

		redirect(303, '/?deleted=1');
	}
};
