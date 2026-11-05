import { DomainError } from '../shared/DomainError';

/** Audience a resource is meant for. */
const ROLE_CODES = ['mentor', 'mentee'] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

const LABELS: Record<RoleCode, string> = {
	mentor: 'Mentor / Coach',
	mentee: 'Mentee / Coachee'
};

/**
 * Value object: the set of roles a resource targets (multi-select).
 *
 * At least one role is required. The set is de-duplicated and kept in
 * canonical order so two Roles built from ["mentee", "mentor"] and
 * ["mentor", "mentor", "mentee"] are equal.
 */
export class Roles {
	private constructor(private readonly codes: readonly RoleCode[]) {}

	static create(raw: readonly string[]): Roles {
		for (const code of raw) {
			if (!Roles.isValidCode(code)) {
				throw new DomainError('ROLE_INVALID', `Unknown role "${code}"`, 'roles');
			}
		}
		const canonical = ROLE_CODES.filter((code) => raw.includes(code));
		if (canonical.length === 0) {
			throw new DomainError('ROLES_EMPTY', 'Select at least one role', 'roles');
		}
		return new Roles(canonical);
	}

	static isValidCode(raw: string): raw is RoleCode {
		return (ROLE_CODES as readonly string[]).includes(raw);
	}

	/** All selectable roles, in display order. Used to build the multi-select. */
	static options(): { code: RoleCode; label: string }[] {
		return ROLE_CODES.map((code) => ({ code, label: LABELS[code] }));
	}

	static labelOf(code: RoleCode): string {
		return LABELS[code];
	}

	has(code: RoleCode): boolean {
		return this.codes.includes(code);
	}

	toArray(): RoleCode[] {
		return [...this.codes];
	}

	equals(other: Roles): boolean {
		return (
			this.codes.length === other.codes.length && this.codes.every((c, i) => c === other.codes[i])
		);
	}
}
