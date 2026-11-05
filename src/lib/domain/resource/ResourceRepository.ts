import type { Resource } from './Resource';
import type { ResourceId } from './ResourceId';

/**
 * Port: persistence of Resource aggregates.
 * Implemented in infrastructure (Postgres via Drizzle) and by an in-memory
 * fake for tests. The core never knows which one it is talking to.
 */
export interface ResourceRepository {
	/** Inserts a new resource or updates an existing one (upsert by id). */
	save(resource: Resource): Promise<void>;
	findById(id: ResourceId): Promise<Resource | null>;
	/** All resources, newest upload first. */
	findAll(): Promise<Resource[]>;
}
