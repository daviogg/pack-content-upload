import { ResourceId } from '../../domain/resource/ResourceId';
import type { ResourceRepository } from '../../domain/resource/ResourceRepository';
import type { Disposition, FileStorage } from '../ports/FileStorage';

/**
 * What the HTTP adapter should do to deliver the file:
 * - `redirect`: the storage signed a URL, send the browser straight there;
 * - `stream`: pipe the bytes through the app with the right headers.
 */
export type OpenResourceFileResult =
	| { type: 'redirect'; url: string }
	| {
			type: 'stream';
			body: ReadableStream<Uint8Array>;
			contentType: string;
			fileName: string;
			sizeBytes: number;
			disposition: Disposition;
	  };

/** Use case: a user clicks a resource to access the uploaded file. */
export class OpenResourceFile {
	constructor(
		private readonly repository: ResourceRepository,
		private readonly storage: FileStorage
	) {}

	async execute(
		rawId: string,
		disposition: Disposition = 'inline'
	): Promise<OpenResourceFileResult | null> {
		const resource = await this.repository.findById(ResourceId.create(rawId));
		if (!resource) return null;

		const { key, mimeType, originalName, sizeBytes } = resource.file;

		const url = await this.storage.getSignedUrl(key, {
			fileName: originalName,
			mimeType,
			disposition
		});
		if (url) return { type: 'redirect', url };

		return {
			type: 'stream',
			body: await this.storage.open(key),
			contentType: mimeType,
			fileName: originalName,
			sizeBytes,
			disposition
		};
	}
}
