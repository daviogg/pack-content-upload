import { ResourceId } from '../../domain/resource/ResourceId';
import type { ResourceRepository } from '../../domain/resource/ResourceRepository';
import { toResourceSummary, type ResourceSummary } from '../dto/ResourceSummary';

/**
 * Use case: a user opens a resource's detail page.
 * Loads the aggregate, records the view and returns the updated summary,
 * or `null` when the id is unknown (the page turns that into a 404).
 */
export class ViewResource {
	constructor(private readonly repository: ResourceRepository) {}

	async execute(rawId: string): Promise<ResourceSummary | null> {
		const resource = await this.repository.findById(ResourceId.create(rawId));
		if (!resource) return null;

		resource.recordView();
		await this.repository.save(resource);

		return toResourceSummary(resource);
	}
}
