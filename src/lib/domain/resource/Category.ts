import { DomainError } from '../shared/DomainError';

/** Topic the resource belongs to. Extend this list to add a category. */
const CATEGORY_CODES = [
	'leadership',
	'managing-complexity',
	'communication',
	'conflict-resolution',
	'personal-growth'
] as const;

export type CategoryCode = (typeof CATEGORY_CODES)[number];

const LABELS: Record<CategoryCode, string> = {
	leadership: 'Leadership',
	'managing-complexity': 'Managing Complexity',
	communication: 'Communication',
	'conflict-resolution': 'Conflict Resolution',
	'personal-growth': 'Personal Growth'
};

/** Value object: category of the resource, from a closed list. */
export class Category {
	private constructor(readonly code: CategoryCode) {}

	static create(raw: string): Category {
		if (!Category.isValid(raw)) {
			throw new DomainError('CATEGORY_INVALID', `Unknown category "${raw}"`, 'category');
		}
		return new Category(raw);
	}

	static isValid(raw: string): raw is CategoryCode {
		return (CATEGORY_CODES as readonly string[]).includes(raw);
	}

	static all(): Category[] {
		return CATEGORY_CODES.map((code) => new Category(code));
	}

	get label(): string {
		return LABELS[this.code];
	}

	equals(other: Category): boolean {
		return this.code === other.code;
	}
}
