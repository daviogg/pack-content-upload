import { DomainError } from '../shared/DomainError';

/**
 * Value object: the title of a resource.
 *
 * Invariants: trimmed, not empty, at most MAX_LENGTH characters.
 * A Title can only be obtained through `Title.create`, so an instance is
 * always valid; the rest of the code never re-checks these rules.
 */
export class Title {
	static readonly MAX_LENGTH = 200;

	private constructor(private readonly value: string) {}

	static create(raw: string): Title {
		const trimmed = raw.trim();
		if (trimmed.length === 0) {
			throw new DomainError('TITLE_EMPTY', 'Title is required', 'title');
		}
		if (trimmed.length > Title.MAX_LENGTH) {
			throw new DomainError(
				'TITLE_TOO_LONG',
				`Title must be at most ${Title.MAX_LENGTH} characters`,
				'title'
			);
		}
		return new Title(trimmed);
	}

	toString(): string {
		return this.value;
	}

	equals(other: Title): boolean {
		return this.value === other.value;
	}
}
