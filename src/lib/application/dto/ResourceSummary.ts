import type { Resource } from '../../domain/resource/Resource';
import type { FileKind } from '../../domain/resource/StoredFile';
import { Roles } from '../../domain/resource/Roles';

/**
 * Read model handed to the UI. Plain data only (no classes) so SvelteKit can
 * serialize it from `load` to the browser. Codes come with their labels so
 * the UI never has to import the domain to render a row.
 */
export interface ResourceSummary {
	id: string;
	title: string;
	description: string;
	category: { code: string; label: string };
	language: { code: string; label: string };
	provider: { code: string; label: string };
	roles: { code: string; label: string }[];
	file: {
		kind: FileKind;
		originalName: string;
		mimeType: string;
		sizeBytes: number;
	};
	viewCount: number;
	uploadedAt: string; // ISO 8601
}

export function toResourceSummary(resource: Resource): ResourceSummary {
	return {
		id: resource.id.toString(),
		title: resource.title.toString(),
		description: resource.description.toString(),
		category: { code: resource.category.code, label: resource.category.label },
		language: { code: resource.language.code, label: resource.language.label },
		provider: { code: resource.provider.code, label: resource.provider.label },
		roles: resource.roles.toArray().map((code) => ({ code, label: Roles.labelOf(code) })),
		file: {
			kind: resource.file.kind,
			originalName: resource.file.originalName,
			mimeType: resource.file.mimeType,
			sizeBytes: resource.file.sizeBytes
		},
		viewCount: resource.viewCount,
		uploadedAt: resource.uploadedAt.toISOString()
	};
}
