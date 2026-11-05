import { describe, expect, it } from 'vitest';
import { OpenResourceFile } from './OpenResourceFile';
import { UploadResource } from './UploadResource';
import { InMemoryResourceRepository } from '../../testing/fakes/InMemoryResourceRepository';
import { InMemoryFileStorage } from '../../testing/fakes/InMemoryFileStorage';
import { FixedClock } from '../../testing/fakes/FixedClock';
import { SequentialIdGenerator } from '../../testing/fakes/SequentialIdGenerator';

async function setup(storage: InMemoryFileStorage) {
	const repository = new InMemoryResourceRepository();
	const upload = new UploadResource({
		repository,
		storage,
		clock: new FixedClock(),
		ids: new SequentialIdGenerator()
	});
	const id = await upload.execute({
		title: 'Talk',
		description: 'A talk',
		category: 'leadership',
		language: 'it',
		provider: 'mentor',
		roles: ['mentor'],
		file: {
			blob: new Blob(['video-bytes'], { type: 'video/mp4' }),
			name: 'talk.mp4',
			mimeType: 'video/mp4',
			sizeBytes: 11
		}
	});
	return { open: new OpenResourceFile(repository, storage), id: id.toString() };
}

describe('OpenResourceFile', () => {
	it('redirects when the storage can sign URLs', async () => {
		const { open, id } = await setup(new InMemoryFileStorage('https://cdn.example'));
		const result = await open.execute(id);
		expect(result).toEqual({
			type: 'redirect',
			url: `https://cdn.example/resources/${id}/talk.mp4?signed=1`
		});
	});

	it('streams the bytes with metadata when it cannot', async () => {
		const { open, id } = await setup(new InMemoryFileStorage());
		const result = await open.execute(id);
		expect(result?.type).toBe('stream');
		if (result?.type !== 'stream') return;

		expect(result.contentType).toBe('video/mp4');
		expect(result.fileName).toBe('talk.mp4');
		expect(result.sizeBytes).toBe(11);
		expect(await new Response(result.body).text()).toBe('video-bytes');
	});

	it('returns null for an unknown id', async () => {
		const { open } = await setup(new InMemoryFileStorage());
		expect(await open.execute('00000000-0000-4000-8000-000000000999')).toBeNull();
	});
});
