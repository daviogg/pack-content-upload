/** How the browser should treat the bytes: show them or save them. */
export type Disposition = 'inline' | 'attachment';

/** What a signed URL must carry so the storage serves the file like the app would. */
export interface SignedUrlOptions {
	fileName: string;
	mimeType: string;
	disposition: Disposition;
}

/**
 * Port: where uploaded bytes live. Implemented by a local-disk adapter and
 * an S3-compatible adapter (Cloudflare R2).
 */
export interface FileStorage {
	/** Stores the file under `key`, overwriting any previous content. */
	put(key: string, file: Blob): Promise<void>;

	/** Opens the stored bytes for streaming through the application. */
	open(key: string): Promise<ReadableStream<Uint8Array>>;

	/**
	 * Returns a short-lived URL the browser can fetch directly, or `null`
	 * when the storage cannot provide one (then the app streams via `open`).
	 */
	getSignedUrl(key: string, options: SignedUrlOptions): Promise<string | null>;

	delete(key: string): Promise<void>;
}
