import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DomainError } from '#lib/domain/shared/DomainError.ts';
import { container } from '#lib/infrastructure/container.ts';
import { contentDisposition } from '#lib/infrastructure/http/contentDisposition.ts';

/**
 * GET /files/<id>            → the file, inline (viewer, <iframe>, <video>)
 * GET /files/<id>?download=1 → the file as an attachment (Save as…)
 *
 * Primary adapter for OpenResourceFile: a `redirect` result becomes an HTTP
 * redirect to the signed URL, a `stream` result is piped with the right headers.
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const disposition = url.searchParams.has('download') ? 'attachment' : 'inline';

	let result;
	try {
		result = await container.openResourceFile.execute(params.id, disposition);
	} catch (e) {
		if (e instanceof DomainError) error(400, e.message); // malformed id
		throw e;
	}
	if (!result) error(404, 'Resource not found');

	if (result.type === 'redirect') redirect(302, result.url);

	return new Response(result.body, {
		headers: {
			'Content-Type': result.contentType,
			'Content-Length': String(result.sizeBytes),
			'Content-Disposition': contentDisposition(result.disposition, result.fileName),
			'Cache-Control': 'private, max-age=0'
		}
	});
};
