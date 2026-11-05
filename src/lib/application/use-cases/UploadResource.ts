import { Category } from '../../domain/resource/Category';
import { Description } from '../../domain/resource/Description';
import { Language } from '../../domain/resource/Language';
import { Provider } from '../../domain/resource/Provider';
import { Resource } from '../../domain/resource/Resource';
import { ResourceId } from '../../domain/resource/ResourceId';
import type { ResourceRepository } from '../../domain/resource/ResourceRepository';
import { Roles } from '../../domain/resource/Roles';
import { StoredFile } from '../../domain/resource/StoredFile';
import { Title } from '../../domain/resource/Title';
import type { Clock } from '../ports/Clock';
import type { FileStorage } from '../ports/FileStorage';
import type { IdGenerator } from '../ports/IdGenerator';

/** Raw input as it arrives from the form. Plain strings: validation happens in the domain. */
export interface UploadResourceCommand {
	title: string;
	description: string;
	category: string;
	language: string;
	provider: string;
	roles: string[];
	file: {
		blob: Blob;
		name: string;
		mimeType: string;
		sizeBytes: number;
	};
}

export interface UploadResourceDeps {
	repository: ResourceRepository;
	storage: FileStorage;
	clock: Clock;
	ids: IdGenerator;
}

/**
 * Use case: a user submits the "Upload Resource" form.
 *
 * Order matters:
 *  1. build every value object (any rule violation throws a DomainError
 *     before anything is written anywhere);
 *  2. write the bytes to storage;
 *  3. persist the aggregate; if that fails, delete the bytes so no orphan
 *     file is left behind, then rethrow.
 */
export class UploadResource {
	constructor(private readonly deps: UploadResourceDeps) {}

	async execute(command: UploadResourceCommand): Promise<ResourceId> {
		const id = ResourceId.create(this.deps.ids.next());

		const title = Title.create(command.title);
		const description = Description.create(command.description);
		const category = Category.create(command.category);
		const language = Language.create(command.language);
		const provider = Provider.create(command.provider);
		const roles = Roles.create(command.roles);
		const file = StoredFile.create({
			key: buildStorageKey(id, command.file.name),
			originalName: command.file.name,
			mimeType: command.file.mimeType,
			sizeBytes: command.file.sizeBytes
		});

		await this.deps.storage.put(file.key, command.file.blob);

		const resource = Resource.upload({
			id,
			title,
			description,
			category,
			language,
			provider,
			roles,
			file,
			uploadedAt: this.deps.clock.now()
		});

		try {
			await this.deps.repository.save(resource);
		} catch (error) {
			await this.deps.storage.delete(file.key);
			throw error;
		}

		return id;
	}
}

/**
 * "resources/<id>/<safe-name>": the id prefix makes keys unique, the sanitized
 * name keeps downloads readable and strips path separators and odd characters.
 */
function buildStorageKey(id: ResourceId, originalName: string): string {
	const base = originalName.split(/[\\/]/).pop() ?? '';
	const safe = base.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '') || 'file';
	return `resources/${id.toString()}/${safe}`;
}
