import { DomainError } from '../shared/DomainError';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Identity of a Resource aggregate. A UUID wrapped in a type so an id can
 * never be confused with any other string. Generation is delegated to the
 * IdGenerator port; this class only guarantees the format.
 */
export class ResourceId {
	private constructor(private readonly value: string) {}

	static create(raw: string): ResourceId {
		if (!UUID_PATTERN.test(raw)) {
			throw new DomainError('RESOURCE_ID_INVALID', `"${raw}" is not a valid resource id`);
		}
		return new ResourceId(raw.toLowerCase());
	}

	toString(): string {
		return this.value;
	}

	equals(other: ResourceId): boolean {
		return this.value === other.value;
	}
}
