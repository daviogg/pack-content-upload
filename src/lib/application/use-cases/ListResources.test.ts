import { beforeEach, describe, expect, it } from 'vitest';
import { ListResources } from './ListResources';
import { UploadResource, type UploadResourceCommand } from './UploadResource';
import { InMemoryResourceRepository } from '../../testing/fakes/InMemoryResourceRepository';
import { InMemoryFileStorage } from '../../testing/fakes/InMemoryFileStorage';
import { SequentialIdGenerator } from '../../testing/fakes/SequentialIdGenerator';
import type { Clock } from '../ports/Clock';

/** Clock that advances one minute per call so uploads get distinct timestamps. */
class TickingClock implements Clock {
	private t = new Date('2026-11-05T10:00:00Z').getTime();
	now(): Date {
		this.t += 60_000;
		return new Date(this.t);
	}
}

function command(title: string, mimeType: string, name: string): UploadResourceCommand {
	return {
		title,
		description: `About ${title}`,
		category: 'leadership',
		language: 'en',
		provider: 'pack',
		roles: ['mentor'],
		file: { blob: new Blob(['x']), name, mimeType, sizeBytes: 1 }
	};
}

describe('ListResources', () => {
	let repository: InMemoryResourceRepository;
	let list: ListResources;

	beforeEach(async () => {
		repository = new InMemoryResourceRepository();
		const upload = new UploadResource({
			repository,
			storage: new InMemoryFileStorage(),
			clock: new TickingClock(),
			ids: new SequentialIdGenerator()
		});
		await upload.execute(command('Conflict guide', 'application/pdf', 'guide.pdf'));
		await upload.execute(command('Leadership talk', 'video/mp4', 'talk.mp4'));
		await upload.execute(command('Onboarding deck', 'application/vnd.ms-powerpoint', 'deck.ppt'));
		list = new ListResources(repository);
	});

	it('returns plain summaries, newest first', async () => {
		const rows = await list.execute();
		expect(rows.map((r) => r.title)).toEqual([
			'Onboarding deck',
			'Leadership talk',
			'Conflict guide'
		]);
		expect(rows[0]).toMatchObject({
			category: { code: 'leadership', label: 'Leadership' },
			roles: [{ code: 'mentor', label: 'Mentor / Coach' }],
			file: { kind: 'slides', originalName: 'deck.ppt' },
			viewCount: 0
		});
		expect(typeof rows[0].uploadedAt).toBe('string');
	});

	it('filters by file kind (tabs)', async () => {
		expect((await list.execute({ kinds: ['video'] })).map((r) => r.title)).toEqual([
			'Leadership talk'
		]);
		expect((await list.execute({ kinds: ['pdf', 'text', 'image'] })).map((r) => r.title)).toEqual([
			'Conflict guide'
		]);
	});

	it('searches title and description, case-insensitively', async () => {
		expect((await list.execute({ search: 'CONFLICT' })).map((r) => r.title)).toEqual([
			'Conflict guide'
		]);
		expect((await list.execute({ search: 'about' })).length).toBe(3);
		expect((await list.execute({ search: 'nothing here' })).length).toBe(0);
	});
});
