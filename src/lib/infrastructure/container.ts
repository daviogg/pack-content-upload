import { DATABASE_URL, LOCAL_STORAGE_DIR, STORAGE_DRIVER } from '$app/env/private';
import type { FileStorage } from '../application/ports/FileStorage';
import { ListResources } from '../application/use-cases/ListResources';
import { OpenResourceFile } from '../application/use-cases/OpenResourceFile';
import { UploadResource } from '../application/use-cases/UploadResource';
import { ViewResource } from '../application/use-cases/ViewResource';
import { createDatabase, type Database } from './persistence/drizzle/client';
import { DrizzleResourceRepository } from './persistence/drizzle/DrizzleResourceRepository';
import { runMigrations } from './persistence/drizzle/migrate';
import { LocalFileStorage } from './storage/LocalFileStorage';
import { SystemClock } from './system/SystemClock';
import { UuidIdGenerator } from './system/UuidIdGenerator';

/**
 * Composition root: the single place where ports meet adapters.
 * Everything is created once per process and read lazily so importing
 * this module never opens a connection by itself.
 */
let database: Database | undefined;

function db(): Database {
	database ??= createDatabase(DATABASE_URL);
	return database;
}

let repository: DrizzleResourceRepository | undefined;
let storage: FileStorage | undefined;

function createStorage(): FileStorage {
	if (STORAGE_DRIVER === 's3') {
		throw new Error('STORAGE_DRIVER=s3 is not available yet');
	}
	return new LocalFileStorage(LOCAL_STORAGE_DIR);
}

export const container = {
	get repository(): DrizzleResourceRepository {
		repository ??= new DrizzleResourceRepository(db());
		return repository;
	},

	get storage(): FileStorage {
		storage ??= createStorage();
		return storage;
	},

	get uploadResource(): UploadResource {
		return new UploadResource({
			repository: this.repository,
			storage: this.storage,
			clock: new SystemClock(),
			ids: new UuidIdGenerator()
		});
	},

	get openResourceFile(): OpenResourceFile {
		return new OpenResourceFile(this.repository, this.storage);
	},

	get listResources(): ListResources {
		return new ListResources(this.repository);
	},

	get viewResource(): ViewResource {
		return new ViewResource(this.repository);
	},

	/** Called once at server start (see src/hooks.server.ts). */
	migrate(): Promise<void> {
		return runMigrations(db());
	}
};
