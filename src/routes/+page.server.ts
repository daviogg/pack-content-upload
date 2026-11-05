import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { DomainError } from '#lib/domain/shared/DomainError.ts';
import { container } from '#lib/infrastructure/container.ts';
import { findTab } from '#lib/ui/tabs.ts';
import { readUploadFormValues, uploadFormOptions } from '#lib/ui/uploadForm.ts';

/**
 * Resources list. Tab and search live in the URL (?tab=videos&q=conflict)
 * so the page is shareable and works without client-side JavaScript.
 * `?upload=1` opens the upload dialog, `?uploaded=1` shows the success toast.
 */
export const load: PageServerLoad = async ({ url }) => {
	const tab = findTab(url.searchParams.get('tab'));
	const search = url.searchParams.get('q') ?? '';

	const resources = await container.listResources.execute({
		kinds: [...tab.kinds],
		search
	});

	return {
		resources,
		tab: tab.id,
		search,
		uploadOpen: url.searchParams.has('upload'),
		justUploaded: url.searchParams.has('uploaded'),
		options: uploadFormOptions()
	};
};

export const actions: Actions = {
	/** The "Upload Resource" form. Primary adapter for the UploadResource use case. */
	upload: async ({ request }) => {
		const data = await request.formData();
		const values = readUploadFormValues(data);
		const file = data.get('file');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { values, error: { field: 'file', message: 'A file is required' } });
		}

		try {
			await container.uploadResource.execute({
				...values,
				file: { blob: file, name: file.name, mimeType: file.type, sizeBytes: file.size }
			});
		} catch (error) {
			if (error instanceof DomainError) {
				return fail(400, { values, error: { field: error.field, message: error.message } });
			}
			throw error;
		}

		redirect(303, '/?uploaded=1');
	}
};
