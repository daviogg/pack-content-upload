import { DomainError } from '../shared/DomainError';

/**
 * Value object: the description of a resource.
 * Invariants: trimmed, not empty, at most MAX_LENGTH characters.
 */
export class Description {
	static readonly MAX_LENGTH = 1000;

	private constructor(private readonly value: string) {}

	static create(raw: string): Description {
		const trimmed = raw.trim();
		if (trimmed.length === 0) {
			throw new DomainError('DESCRIPTION_EMPTY', 'Description is required', 'description');
		}
		if (trimmed.length > Description.MAX_LENGTH) {
			throw new DomainError(
				'DESCRIPTION_TOO_LONG',
				`Description must be at most ${Description.MAX_LENGTH} characters`,
				'description'
			);
		}
		return new Description(trimmed);
	}

	toString(): string {
		return this.value;
	}

	equals(other: Description): boolean {
		return this.value === other.value;
	}
}
