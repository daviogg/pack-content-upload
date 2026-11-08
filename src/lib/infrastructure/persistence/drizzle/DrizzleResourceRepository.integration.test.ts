import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createDatabase, type Database } from './client';
import { DrizzleResourceRepository } from './DrizzleResourceRepository';
import { resources } from './schema';
import { Category } from '../../../domain/resource/Category';
import { Description } from '../../../domain/resource/Description';
import { Language } from '../../../domain/resource/Language';
import { Provider } from '../../../domain/resource/Provider';
import { Resource } from '../../../domain/resource/Resource';
import { ResourceId } from '../../../domain/resource/ResourceId';
import { Roles } from '../../../domain/resource/Roles';
import { StoredFile } from '../../../domain/resource/StoredFile';
import { Title } from '../../../domain/resource/Title';

/**
 * Runs against the Postgres started by `docker compose up db`.
 * Needs DATABASE_URL (loaded from .env by vite.config.ts).
 */
const DATABASE_URL = process.env.DATABASE_URL;

function resource(n: number, uploadedAt: Date): Resource {
	return Resource.upload({
		id: ResourceId.create(`00000000-0000-4000-8000-${String(n).padStart(12, '0')}`),
		title: Title.create(`Resource ${n}`),
		description: Description.create(`Description ${n}`),
		category: Category.create('leadership'),
		language: Language.create('it'),
		provider: Provider.create('skilla'),
		roles: Roles.create(['mentor', 'mentee']),
		file: StoredFile.create({
			key: `resources/${n}/file.pdf`,
			originalName: 'file.pdf',
			mimeType: 'application/pdf',
			sizeBytes: 100 * n
		}),
		uploadedAt
	});
}

describe.skipIf(!DATABASE_URL)('DrizzleResourceRepository (integration)', () => {
	let db: Database;
	let repository: DrizzleResourceRepository;

	beforeAll(async () => {
		db = createDatabase(DATABASE_URL!);
		await migrate(db, { migrationsFolder: './drizzle' });
		repository = new DrizzleResourceRepository(db);
	});

	beforeEach(async () => {
		await db.delete(resources);
	});

	afterAll(async () => {
		await db.$client.end();
	});

	it('round-trips an aggregate through the database', async () => {
		const original = resource(1, new Date('2026-11-05T10:00:00Z'));
		await repository.save(original);

		const loaded = await repository.findById(original.id);
		expect(loaded).not.toBeNull();
		expect(loaded!.title.equals(original.title)).toBe(true);
		expect(loaded!.roles.toArray()).toEqual(['mentor', 'mentee']);
		expect(loaded!.file.kind).toBe('pdf');
		expect(loaded!.file.sizeBytes).toBe(100);
		expect(loaded!.viewCount).toBe(0);
		expect(loaded!.uploadedAt.toISOString()).toBe('2026-11-05T10:00:00.000Z');
	});

	it('updates in place when saving the same id again', async () => {
		const r = resource(2, new Date('2026-11-05T10:00:00Z'));
		await repository.save(r);
		r.recordView();
		r.recordView();
		await repository.save(r);

		expect((await repository.findAll()).length).toBe(1);
		expect((await repository.findById(r.id))!.viewCount).toBe(2);
	});

	it('lists newest first', async () => {
		await repository.save(resource(3, new Date('2026-11-05T10:00:00Z')));
		await repository.save(resource(4, new Date('2026-11-05T12:00:00Z')));
		await repository.save(resource(5, new Date('2026-11-05T11:00:00Z')));

		const titles = (await repository.findAll()).map((r) => r.title.toString());
		expect(titles).toEqual(['Resource 4', 'Resource 5', 'Resource 3']);
	});

	it('deletes a resource and ignores unknown ids', async () => {
		const r = resource(6, new Date('2026-11-05T10:00:00Z'));
		await repository.save(r);

		await repository.delete(r.id);
		await repository.delete(r.id);

		expect(await repository.findById(r.id)).toBeNull();
	});

	it('returns null for an unknown id', async () => {
		expect(
			await repository.findById(ResourceId.create('00000000-0000-4000-8000-000000000999'))
		).toBeNull();
	});
});
