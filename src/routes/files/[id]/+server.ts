import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DomainError } from '#lib/domain/shared/DomainError.ts';
import { container } from '#lib/infrastructure/container.ts';

/**
 * GET /files/<id>            → the file, inline (viewer, <iframe>, <video>)
 * GET /files/<id>?download=1 → the file as an attachment (Save as…)
 *
 * Primary adapter for OpenResourceFile: a `redirect` result becomes an HTTP
 * redirect to the signed URL, a `stream` result is piped with the right headers.
 */
export const GET: RequestHandler = async ({ params, url }) => {
	let result;
	try {
		result = await container.openResourceFile.execute(params.id);
	} catch (e) {
		if (e instanceof DomainError) error(400, e.message); // malformed id
		throw e;
	}
	if (!result) error(404, 'Resource not found');

	if (result.type === 'redirect') redirect(302, result.url);

	const disposition = url.searchParams.has('download') ? 'attachment' : 'inline';
	return new Response(result.body, {
		headers: {
			'Content-Type': result.contentType,
			'Content-Length': String(result.sizeBytes),
			'Content-Disposition': `${disposition}; ${contentDispositionFilename(result.fileName)}`,
			'Cache-Control': 'private, max-age=0'
		}
	});
};

/** ASCII fallback plus RFC 5987 UTF-8 name, so "guida sull'ética.pdf" survives every browser. */
function contentDispositionFilename(name: string): string {
	const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, "'");
	return `filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}
