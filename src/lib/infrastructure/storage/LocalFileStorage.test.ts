import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LocalFileStorage } from './LocalFileStorage';

describe('LocalFileStorage', () => {
	let dir: string;
	let storage: LocalFileStorage;

	beforeEach(async () => {
		dir = await mkdtemp(path.join(os.tmpdir(), 'pack-storage-'));
		storage = new LocalFileStorage(dir);
	});

	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	it('writes, reads back and deletes a file', async () => {
		await storage.put('resources/abc/guide.pdf', new Blob(['hello']));

		const text = await new Response(await storage.open('resources/abc/guide.pdf')).text();
		expect(text).toBe('hello');

		await storage.delete('resources/abc/guide.pdf');
		await expect(storage.open('resources/abc/guide.pdf')).rejects.toThrow();
	});

	it('never signs URLs', async () => {
		expect(await storage.getSignedUrl()).toBeNull();
	});

	it('refuses keys that escape the root directory', async () => {
		await expect(storage.put('../outside.txt', new Blob(['x']))).rejects.toThrow(/escapes/);
	});
});
