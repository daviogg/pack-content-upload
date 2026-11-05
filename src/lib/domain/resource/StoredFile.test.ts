import { describe, expect, it } from 'vitest';
import { StoredFile } from './StoredFile';
import { DomainError } from '../shared/DomainError';

const valid = {
	key: 'resources/abc/guide.pdf',
	originalName: 'guide.pdf',
	mimeType: 'application/pdf',
	sizeBytes: 1024
};

function codeOf(fn: () => unknown): string | undefined {
	try {
		fn();
	} catch (error) {
		return (error as DomainError).code;
	}
}

describe('StoredFile', () => {
	it('derives the kind from the mime type', () => {
		expect(StoredFile.create(valid).kind).toBe('pdf');
		expect(StoredFile.create({ ...valid, mimeType: 'video/mp4' }).kind).toBe('video');
		expect(StoredFile.create({ ...valid, mimeType: 'text/plain' }).kind).toBe('text');
		expect(
			StoredFile.create({
				...valid,
				mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
			}).kind
		).toBe('slides');
		expect(StoredFile.create({ ...valid, mimeType: 'image/png' }).kind).toBe('image');
	});

	it('rejects mime types outside the whitelist', () => {
		expect(
			codeOf(() => StoredFile.create({ ...valid, mimeType: 'application/x-msdownload' }))
		).toBe('FILE_TYPE_NOT_ALLOWED');
	});

	it('rejects empty files and files over 200 MB', () => {
		expect(codeOf(() => StoredFile.create({ ...valid, sizeBytes: 0 }))).toBe('FILE_EMPTY');
		expect(
			codeOf(() => StoredFile.create({ ...valid, sizeBytes: StoredFile.MAX_SIZE_BYTES }))
		).toBe(undefined);
		expect(
			codeOf(() => StoredFile.create({ ...valid, sizeBytes: StoredFile.MAX_SIZE_BYTES + 1 }))
		).toBe('FILE_TOO_LARGE');
	});

	it('requires a key and an original name', () => {
		expect(codeOf(() => StoredFile.create({ ...valid, key: ' ' }))).toBe('FILE_MISSING');
		expect(codeOf(() => StoredFile.create({ ...valid, originalName: '' }))).toBe('FILE_MISSING');
	});

	it('attaches every violation to the "file" field', () => {
		try {
			StoredFile.create({ ...valid, mimeType: 'application/zip' });
		} catch (error) {
			expect((error as DomainError).field).toBe('file');
		}
	});

	it('exposes the whitelist for the file input', () => {
		expect(StoredFile.allowedMimeTypes()).toContain('application/pdf');
		expect(StoredFile.isMimeTypeAllowed('video/webm')).toBe(true);
		expect(StoredFile.isMimeTypeAllowed('application/zip')).toBe(false);
	});
});
