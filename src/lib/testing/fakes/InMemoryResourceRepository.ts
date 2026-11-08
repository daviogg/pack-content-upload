import type { Resource } from '../../domain/resource/Resource';
import type { ResourceId } from '../../domain/resource/ResourceId';
import type { ResourceRepository } from '../../domain/resource/ResourceRepository';

/** Test double: keeps aggregates in a Map, newest upload first on `findAll`. */
export class InMemoryResourceRepository implements ResourceRepository {
	private readonly items = new Map<string, Resource>();

	/** Set to true to simulate a database failure on the next `save`. */
	failNextSave = false;

	async save(resource: Resource): Promise<void> {
		if (this.failNextSave) {
			this.failNextSave = false;
			throw new Error('simulated database failure');
		}
		this.items.set(resource.id.toString(), resource);
	}

	async findById(id: ResourceId): Promise<Resource | null> {
		return this.items.get(id.toString()) ?? null;
	}

	async findAll(): Promise<Resource[]> {
		return [...this.items.values()].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
	}

	async delete(id: ResourceId): Promise<void> {
		this.items.delete(id.toString());
	}
}
