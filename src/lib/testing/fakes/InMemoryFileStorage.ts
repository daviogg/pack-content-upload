import type { FileStorage } from '../../application/ports/FileStorage';

/** Test double: stores blobs in a Map and can optionally pretend to sign URLs. */
export class InMemoryFileStorage implements FileStorage {
	readonly files = new Map<string, Blob>();

	constructor(private readonly signedUrlBase: string | null = null) {}

	async put(key: string, file: Blob): Promise<void> {
		this.files.set(key, file);
	}

	async open(key: string): Promise<ReadableStream<Uint8Array>> {
		const blob = this.files.get(key);
		if (!blob) throw new Error(`no file stored under "${key}"`);
		return blob.stream();
	}

	async getSignedUrl(key: string): Promise<string | null> {
		return this.signedUrlBase ? `${this.signedUrlBase}/${key}?signed=1` : null;
	}

	async delete(key: string): Promise<void> {
		this.files.delete(key);
	}
}
