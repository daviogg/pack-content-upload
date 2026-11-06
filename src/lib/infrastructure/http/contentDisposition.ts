import type { Disposition } from '../../application/ports/FileStorage';

/**
 * Builds a Content-Disposition header value with an ASCII fallback plus the
 * RFC 5987 UTF-8 name, so "guida sull'ética.pdf" survives every browser.
 * Shared by the /files endpoint (streaming) and the S3 adapter (signed URLs).
 */
export function contentDisposition(disposition: Disposition, fileName: string): string {
	const ascii = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, "'");
	return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
