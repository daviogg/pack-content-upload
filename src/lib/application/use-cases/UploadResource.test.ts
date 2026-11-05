import { beforeEach, describe, expect, it } from 'vitest';
import { UploadResource, type UploadResourceCommand } from './UploadResource';
import { InMemoryResourceRepository } from '../../testing/fakes/InMemoryResourceRepository';
import { InMemoryFileStorage } from '../../testing/fakes/InMemoryFileStorage';
import { FixedClock } from '../../testing/fakes/FixedClock';
import { SequentialIdGenerator } from '../../testing/fakes/SequentialIdGenerator';
import { DomainError } from '../../domain/shared/DomainError';

function validCommand(overrides: Partial<UploadResourceCommand> = {}): UploadResourceCommand {
	return {
		title: 'How to deal with conflict',
		description: 'Step by step guide',
		category: 'conflict-resolution',
		language: 'en',
		provider: 'pack',
		roles: ['mentor', 'mentee'],
		file: {
			blob: new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
			name: 'guide.pdf',
			mimeType: 'application/pdf',
			sizeBytes: 8
		},
		...overrides
	};
}

describe('UploadResource', () => {
	let repository: InMemoryResourceRepository;
	let storage: InMemoryFileStorage;
	let useCase: UploadResource;

	beforeEach(() => {
		repository = new InMemoryResourceRepository();
		storage = new InMemoryFileStorage();
		useCase = new UploadResource({
			repository,
			storage,
			clock: new FixedClock(new Date('2026-11-05T10:00:00Z')),
			ids: new SequentialIdGenerator()
		});
	});

	it('stores the file and persists the resource', async () => {
		const id = await useCase.execute(validCommand());

		expect(id.toString()).toBe('00000000-0000-4000-8000-000000000001');
		expect(storage.files.has(`resources/${id}/guide.pdf`)).toBe(true);

		const saved = await repository.findById(id);
		expect(saved?.title.toString()).toBe('How to deal with conflict');
		expect(saved?.roles.toArray()).toEqual(['mentor', 'mentee']);
		expect(saved?.file.kind).toBe('pdf');
		expect(saved?.viewCount).toBe(0);
		expect(saved?.uploadedAt.toISOString()).toBe('2026-11-05T10:00:00.000Z');
	});

	it('rejects invalid input before touching storage or repository', async () => {
		await expect(useCase.execute(validCommand({ title: '' }))).rejects.toThrowError(DomainError);
		await expect(
			useCase.execute(
				validCommand({ file: { ...validCommand().file, mimeType: 'application/zip' } })
			)
		).rejects.toMatchObject({ code: 'FILE_TYPE_NOT_ALLOWED', field: 'file' });

		expect(storage.files.size).toBe(0);
		expect(await repository.findAll()).toHaveLength(0);
	});

	it('removes the stored file when persisting the resource fails', async () => {
		repository.failNextSave = true;

		await expect(useCase.execute(validCommand())).rejects.toThrow('simulated database failure');

		expect(storage.files.size).toBe(0);
	});

	it('sanitizes the original file name inside the storage key', async () => {
		const id = await useCase.execute(
			validCommand({ file: { ...validCommand().file, name: '../évil name (1).pdf' } })
		);
		const saved = await repository.findById(id);
		expect(saved?.file.key).toBe(`resources/${id}/vil_name_1_.pdf`);
		expect(saved?.file.originalName).toBe('../évil name (1).pdf');
	});
});
