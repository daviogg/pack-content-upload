import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteResource } from './DeleteResource';
import { UploadResource } from './UploadResource';
import { InMemoryResourceRepository } from '../../testing/fakes/InMemoryResourceRepository';
import { InMemoryFileStorage } from '../../testing/fakes/InMemoryFileStorage';
import { FixedClock } from '../../testing/fakes/FixedClock';
import { SequentialIdGenerator } from '../../testing/fakes/SequentialIdGenerator';
import { DomainError } from '../../domain/shared/DomainError';

describe('DeleteResource', () => {
	let repository: InMemoryResourceRepository;
	let storage: InMemoryFileStorage;
	let remove: DeleteResource;
	let id: string;

	beforeEach(async () => {
		repository = new InMemoryResourceRepository();
		storage = new InMemoryFileStorage();
		const upload = new UploadResource({
			repository,
			storage,
			clock: new FixedClock(),
			ids: new SequentialIdGenerator()
		});
		id = (
			await upload.execute({
				title: 'Old guide',
				description: 'To be removed',
				category: 'leadership',
				language: 'en',
				provider: 'pack',
				roles: ['mentor'],
				file: {
					blob: new Blob(['x']),
					name: 'old.pdf',
					mimeType: 'application/pdf',
					sizeBytes: 1
				}
			})
		).toString();
		remove = new DeleteResource(repository, storage);
	});

	it('removes the row and the stored file', async () => {
		expect(storage.files.size).toBe(1);

		expect(await remove.execute(id)).toBe(true);

		expect(await repository.findAll()).toEqual([]);
		expect(storage.files.size).toBe(0);
	});

	it('returns false for an unknown id and touches nothing', async () => {
		expect(await remove.execute('00000000-0000-4000-8000-000000000999')).toBe(false);
		expect((await repository.findAll()).length).toBe(1);
		expect(storage.files.size).toBe(1);
	});

	it('rejects a malformed id', async () => {
		await expect(remove.execute('not-a-uuid')).rejects.toThrowError(DomainError);
	});
});
