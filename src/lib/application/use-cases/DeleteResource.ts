import { ResourceId } from '../../domain/resource/ResourceId';
import type { ResourceRepository } from '../../domain/resource/ResourceRepository';
import type { FileStorage } from '../ports/FileStorage';

/**
 * Use case: an administrator removes a resource.
 * The row goes first so the resource disappears from the list immediately;
 * the file follows. If the storage call fails we are left with an orphan
 * object, never with a row that points to a missing file.
 * Returns false when the id is unknown.
 */
export class DeleteResource {
	constructor(
		private readonly repository: ResourceRepository,
		private readonly storage: FileStorage
	) {}

	async execute(rawId: string): Promise<boolean> {
		const id = ResourceId.create(rawId);
		const resource = await this.repository.findById(id);
		if (!resource) return false;

		await this.repository.delete(id);
		await this.storage.delete(resource.file.key);
		return true;
	}
}
