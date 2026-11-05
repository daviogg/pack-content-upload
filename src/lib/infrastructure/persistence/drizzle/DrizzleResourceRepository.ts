import { desc, eq } from 'drizzle-orm';
import type { Database } from './client';
import { resources, type NewResourceRow, type ResourceRow } from './schema';
import { Category } from '../../../domain/resource/Category';
import { Description } from '../../../domain/resource/Description';
import { Language } from '../../../domain/resource/Language';
import { Provider } from '../../../domain/resource/Provider';
import { Resource } from '../../../domain/resource/Resource';
import { ResourceId } from '../../../domain/resource/ResourceId';
import type { ResourceRepository } from '../../../domain/resource/ResourceRepository';
import { Roles } from '../../../domain/resource/Roles';
import { StoredFile } from '../../../domain/resource/StoredFile';
import { Title } from '../../../domain/resource/Title';

/**
 * Adapter: ResourceRepository backed by PostgreSQL through Drizzle.
 * Translates between the aggregate and the flat `resources` row.
 */
export class DrizzleResourceRepository implements ResourceRepository {
	constructor(private readonly db: Database) {}

	async save(resource: Resource): Promise<void> {
		const row = toRow(resource);
		await this.db
			.insert(resources)
			.values(row)
			.onConflictDoUpdate({ target: resources.id, set: row });
	}

	async findById(id: ResourceId): Promise<Resource | null> {
		const [row] = await this.db
			.select()
			.from(resources)
			.where(eq(resources.id, id.toString()))
			.limit(1);
		return row ? toDomain(row) : null;
	}

	async findAll(): Promise<Resource[]> {
		const rows = await this.db.select().from(resources).orderBy(desc(resources.uploadedAt));
		return rows.map(toDomain);
	}
}

function toRow(resource: Resource): NewResourceRow {
	return {
		id: resource.id.toString(),
		title: resource.title.toString(),
		description: resource.description.toString(),
		category: resource.category.code,
		language: resource.language.code,
		provider: resource.provider.code,
		roles: resource.roles.toArray(),
		fileKey: resource.file.key,
		fileOriginalName: resource.file.originalName,
		fileMimeType: resource.file.mimeType,
		fileSizeBytes: resource.file.sizeBytes,
		viewCount: resource.viewCount,
		uploadedAt: resource.uploadedAt
	};
}

function toDomain(row: ResourceRow): Resource {
	return Resource.reconstitute({
		id: ResourceId.create(row.id),
		title: Title.create(row.title),
		description: Description.create(row.description),
		category: Category.create(row.category),
		language: Language.create(row.language),
		provider: Provider.create(row.provider),
		roles: Roles.create(row.roles),
		file: StoredFile.create({
			key: row.fileKey,
			originalName: row.fileOriginalName,
			mimeType: row.fileMimeType,
			sizeBytes: row.fileSizeBytes
		}),
		viewCount: row.viewCount,
		uploadedAt: row.uploadedAt
	});
}
