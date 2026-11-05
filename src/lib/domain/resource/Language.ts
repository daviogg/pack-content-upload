import { DomainError } from '../shared/DomainError';

/** ISO 639-1 codes the platform supports. Extend this list to add a language. */
const LANGUAGE_CODES = ['en', 'it', 'es', 'fr', 'de', 'pt'] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

const LABELS: Record<LanguageCode, string> = {
	en: 'English',
	it: 'Italian',
	es: 'Spanish',
	fr: 'French',
	de: 'German',
	pt: 'Portuguese'
};

/**
 * Value object: language of the resource content, from a closed list.
 * `code` is what gets persisted; `label` is what the UI shows.
 */
export class Language {
	private constructor(readonly code: LanguageCode) {}

	static create(raw: string): Language {
		if (!Language.isValid(raw)) {
			throw new DomainError('LANGUAGE_INVALID', `Unknown language "${raw}"`, 'language');
		}
		return new Language(raw);
	}

	static isValid(raw: string): raw is LanguageCode {
		return (LANGUAGE_CODES as readonly string[]).includes(raw);
	}

	/** All supported languages, in display order. Used to build select options. */
	static all(): Language[] {
		return LANGUAGE_CODES.map((code) => new Language(code));
	}

	get label(): string {
		return LABELS[this.code];
	}

	equals(other: Language): boolean {
		return this.code === other.code;
	}
}
