import {
	ADMIN_PASSWORD,
	DATABASE_URL,
	LOCAL_STORAGE_DIR,
	S3_ACCESS_KEY_ID,
	S3_BUCKET,
	S3_ENDPOINT,
	S3_REGION,
	S3_SECRET_ACCESS_KEY,
	STORAGE_DRIVER
} from '$app/env/private';
import type { FileStorage } from '../application/ports/FileStorage';
import { DeleteResource } from '../application/use-cases/DeleteResource';
import { AdminSession } from './auth/AdminSession';
import { ListResources } from '../application/use-cases/ListResources';
import { OpenResourceFile } from '../application/use-cases/OpenResourceFile';
import { UploadResource } from '../application/use-cases/UploadResource';
import { ViewResource } from '../application/use-cases/ViewResource';
import { createDatabase, type Database } from './persistence/drizzle/client';
import { DrizzleResourceRepository } from './persistence/drizzle/DrizzleResourceRepository';
import { runMigrations } from './persistence/drizzle/migrate';
import { LocalFileStorage } from './storage/LocalFileStorage';
import { S3FileStorage } from './storage/S3FileStorage';
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
const adminSession = ADMIN_PASSWORD ? new AdminSession(ADMIN_PASSWORD) : null;

function createStorage(): FileStorage {
	if (STORAGE_DRIVER === 'local') return new LocalFileStorage(LOCAL_STORAGE_DIR);

	if (!S3_BUCKET || !S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
		throw new Error(
			'STORAGE_DRIVER=s3 needs S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY'
		);
	}
	return new S3FileStorage({
		bucket: S3_BUCKET,
		region: S3_REGION,
		endpoint: S3_ENDPOINT,
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_SECRET_ACCESS_KEY
	});
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

	get deleteResource(): DeleteResource {
		return new DeleteResource(this.repository, this.storage);
	},

	/** `null` when ADMIN_PASSWORD is not set: the app runs without an administrator. */
	get adminSession(): AdminSession | null {
		return adminSession;
	},

	/** Called once at server start (see src/hooks.server.ts). */
	migrate(): Promise<void> {
		return runMigrations(db());
	}
};
