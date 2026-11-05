import type { FileKind } from '../domain/resource/StoredFile';

/** The list tabs from the design, each mapped to the file kinds it shows. */
export const TABS = [
	{ id: 'all', label: 'All', kinds: [] },
	{ id: 'videos', label: 'Videos', kinds: ['video'] },
	{ id: 'documents', label: 'Documents', kinds: ['pdf', 'text', 'image'] },
	{ id: 'lessons', label: 'Lessons', kinds: ['slides'] }
] as const satisfies readonly { id: string; label: string; kinds: readonly FileKind[] }[];

export type TabId = (typeof TABS)[number]['id'];

export function findTab(id: string | null): (typeof TABS)[number] {
	return TABS.find((tab) => tab.id === id) ?? TABS[0];
}
