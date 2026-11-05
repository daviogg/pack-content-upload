import { createReadStream } from 'node:fs';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import type { FileStorage } from '../../application/ports/FileStorage';

/**
 * Adapter: FileStorage on the local disk (dev / fallback).
 * Files live under `rootDir/<key>`; keys are confined to rootDir so a
 * malicious key can never escape it.
 */
export class LocalFileStorage implements FileStorage {
	constructor(private readonly rootDir: string) {}

	async put(key: string, file: Blob): Promise<void> {
		const target = this.resolve(key);
		await mkdir(path.dirname(target), { recursive: true });
		await writeFile(target, file.stream());
	}

	async open(key: string): Promise<ReadableStream<Uint8Array>> {
		const target = this.resolve(key);
		await access(target); // fail here, with a clear error, rather than mid-stream
		return Readable.toWeb(createReadStream(target)) as ReadableStream<Uint8Array>;
	}

	/** The disk cannot sign URLs: the app streams the file itself. */
	async getSignedUrl(): Promise<string | null> {
		return null;
	}

	async delete(key: string): Promise<void> {
		await rm(this.resolve(key), { force: true });
	}

	private resolve(key: string): string {
		const root = path.resolve(this.rootDir);
		const target = path.resolve(root, key);
		if (!target.startsWith(root + path.sep)) {
			throw new Error(`Storage key "${key}" escapes the storage directory`);
		}
		return target;
	}
}
