import { describe, expect, it } from 'vitest';
import { S3FileStorage } from './S3FileStorage';

/** Signing is pure cryptography on the client: no network needed to test it. */
describe('S3FileStorage', () => {
	const storage = new S3FileStorage({
		bucket: 'pack-resources',
		region: 'auto',
		endpoint: 'https://account.r2.cloudflarestorage.com',
		accessKeyId: 'test-key',
		secretAccessKey: 'test-secret',
		signedUrlTtlSeconds: 600
	});

	it('signs a URL that pins the content type and disposition', async () => {
		const url = new URL(
			await storage.getSignedUrl('resources/abc/guide.pdf', {
				fileName: 'guide.pdf',
				mimeType: 'application/pdf',
				disposition: 'attachment'
			})
		);

		expect(url.origin).toBe('https://account.r2.cloudflarestorage.com');
		expect(url.pathname).toBe('/pack-resources/resources/abc/guide.pdf');
		expect(url.searchParams.get('response-content-type')).toBe('application/pdf');
		expect(url.searchParams.get('response-content-disposition')).toBe(
			`attachment; filename="guide.pdf"; filename*=UTF-8''guide.pdf`
		);
		expect(url.searchParams.get('X-Amz-Expires')).toBe('600');
		expect(url.searchParams.get('X-Amz-Signature')).toMatch(/^[0-9a-f]{64}$/);
	});
});
