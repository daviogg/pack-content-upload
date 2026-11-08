import { Category } from '../domain/resource/Category';
import { Language } from '../domain/resource/Language';
import { Provider } from '../domain/resource/Provider';
import { Roles } from '../domain/resource/Roles';
import { StoredFile } from '../domain/resource/StoredFile';
import { Title } from '../domain/resource/Title';
import { Description } from '../domain/resource/Description';

/** Everything the upload form needs to render its selects and limits. Built on the server. */
export interface UploadFormOptions {
	categories: { code: string; label: string }[];
	languages: { code: string; label: string }[];
	providers: { code: string; label: string }[];
	roles: { code: string; label: string }[];
	accept: string;
	titleMaxLength: number;
	descriptionMaxLength: number;
}

export function uploadFormOptions(): UploadFormOptions {
	return {
		categories: Category.all().map((c) => ({ code: c.code, label: c.label })),
		languages: Language.all().map((l) => ({ code: l.code, label: l.label })),
		providers: Provider.all().map((p) => ({ code: p.code, label: p.label })),
		roles: Roles.options(),
		accept: StoredFile.allowedMimeTypes().join(','),
		titleMaxLength: Title.MAX_LENGTH,
		descriptionMaxLength: Description.MAX_LENGTH
	};
}

/** Text fields echoed back to the form after a failed submit (the file cannot be). */
export interface UploadFormValues {
	title: string;
	description: string;
	category: string;
	language: string;
	provider: string;
	roles: string[];
}

export function readUploadFormValues(data: FormData): UploadFormValues {
	const text = (name: string) => {
		const value = data.get(name);
		return typeof value === 'string' ? value : '';
	};
	return {
		title: text('title'),
		description: text('description'),
		category: text('category'),
		language: text('language'),
		provider: text('provider'),
		// The select's placeholder submits "", which is "no role", not an unknown one
		roles: data.getAll('roles').filter((r): r is string => typeof r === 'string' && r !== '')
	};
}
