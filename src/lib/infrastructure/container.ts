import { DATABASE_URL } from '$app/env/private';
import { ListResources } from '../application/use-cases/ListResources';
import { ViewResource } from '../application/use-cases/ViewResource';
import { createDatabase, type Database } from './persistence/drizzle/client';
import { DrizzleResourceRepository } from './persistence/drizzle/DrizzleResourceRepository';
import { runMigrations } from './persistence/drizzle/migrate';

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

export const container = {
	get repository(): DrizzleResourceRepository {
		repository ??= new DrizzleResourceRepository(db());
		return repository;
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
