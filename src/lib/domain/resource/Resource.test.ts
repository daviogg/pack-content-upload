import { describe, expect, it } from 'vitest';
import { Category } from './Category';
import { Description } from './Description';
import { Language } from './Language';
import { Provider } from './Provider';
import { Resource } from './Resource';
import { ResourceId } from './ResourceId';
import { Roles } from './Roles';
import { StoredFile } from './StoredFile';
import { Title } from './Title';

function buildInput() {
	return {
		id: ResourceId.create('6f1c2a3e-9b4d-4c5e-8f7a-1b2c3d4e5f60'),
		title: Title.create('How to deal with conflict'),
		description: Description.create('Step by step guide'),
		category: Category.create('conflict-resolution'),
		language: Language.create('en'),
		provider: Provider.create('pack'),
		roles: Roles.create(['mentor']),
		file: StoredFile.create({
			key: 'resources/6f1c2a3e/guide.pdf',
			originalName: 'guide.pdf',
			mimeType: 'application/pdf',
			sizeBytes: 2048
		}),
		uploadedAt: new Date('2026-11-05T10:00:00Z')
	};
}

describe('Resource', () => {
	it('starts with zero views when uploaded', () => {
		const resource = Resource.upload(buildInput());
		expect(resource.viewCount).toBe(0);
		expect(resource.title.toString()).toBe('How to deal with conflict');
		expect(resource.file.kind).toBe('pdf');
	});

	it('counts views', () => {
		const resource = Resource.upload(buildInput());
		resource.recordView();
		resource.recordView();
		expect(resource.viewCount).toBe(2);
	});

	it('reconstitutes from persisted props without resetting state', () => {
		const resource = Resource.reconstitute({ ...buildInput(), viewCount: 42 });
		expect(resource.viewCount).toBe(42);
		expect(resource.uploadedAt.toISOString()).toBe('2026-11-05T10:00:00.000Z');
	});
});
