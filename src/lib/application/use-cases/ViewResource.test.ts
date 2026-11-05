import { beforeEach, describe, expect, it } from 'vitest';
import { ViewResource } from './ViewResource';
import { UploadResource } from './UploadResource';
import { InMemoryResourceRepository } from '../../testing/fakes/InMemoryResourceRepository';
import { InMemoryFileStorage } from '../../testing/fakes/InMemoryFileStorage';
import { FixedClock } from '../../testing/fakes/FixedClock';
import { SequentialIdGenerator } from '../../testing/fakes/SequentialIdGenerator';
import { DomainError } from '../../domain/shared/DomainError';

describe('ViewResource', () => {
	let repository: InMemoryResourceRepository;
	let view: ViewResource;
	let id: string;

	beforeEach(async () => {
		repository = new InMemoryResourceRepository();
		const upload = new UploadResource({
			repository,
			storage: new InMemoryFileStorage(),
			clock: new FixedClock(),
			ids: new SequentialIdGenerator()
		});
		id = (
			await upload.execute({
				title: 'Conflict guide',
				description: 'Guide',
				category: 'conflict-resolution',
				language: 'en',
				provider: 'pack',
				roles: ['mentee'],
				file: {
					blob: new Blob(['x']),
					name: 'guide.pdf',
					mimeType: 'application/pdf',
					sizeBytes: 1
				}
			})
		).toString();
		view = new ViewResource(repository);
	});

	it('returns the summary and counts the view', async () => {
		const first = await view.execute(id);
		const second = await view.execute(id);
		expect(first?.viewCount).toBe(1);
		expect(second?.viewCount).toBe(2);
		expect(second?.title).toBe('Conflict guide');
	});

	it('returns null for an unknown id', async () => {
		expect(await view.execute('00000000-0000-4000-8000-000000000999')).toBeNull();
	});

	it('rejects a malformed id', async () => {
		await expect(view.execute('not-a-uuid')).rejects.toThrowError(DomainError);
	});
});
