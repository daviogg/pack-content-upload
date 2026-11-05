import type { ResourceRepository } from '../../domain/resource/ResourceRepository';
import type { FileKind } from '../../domain/resource/StoredFile';
import { toResourceSummary, type ResourceSummary } from '../dto/ResourceSummary';

export interface ListResourcesQuery {
	/** Keep only these file kinds (the "Videos / Documents / Lessons" tabs). Empty = all. */
	kinds?: FileKind[];
	/** Case-insensitive match on title or description (the search field). */
	search?: string;
}

/** Use case: the resources table, newest first, optionally filtered. */
export class ListResources {
	constructor(private readonly repository: ResourceRepository) {}

	async execute(query: ListResourcesQuery = {}): Promise<ResourceSummary[]> {
		const kinds = query.kinds ?? [];
		const needle = query.search?.trim().toLowerCase() ?? '';

		const resources = await this.repository.findAll();

		return resources
			.filter((r) => kinds.length === 0 || kinds.includes(r.file.kind))
			.filter(
				(r) =>
					needle === '' ||
					r.title.toString().toLowerCase().includes(needle) ||
					r.description.toString().toLowerCase().includes(needle)
			)
			.map(toResourceSummary);
	}
}
