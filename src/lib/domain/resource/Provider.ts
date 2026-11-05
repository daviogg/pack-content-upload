import { DomainError } from '../shared/DomainError';

/** Owner of the content. Extend this list to add a provider. */
const PROVIDER_CODES = ['skilla', 'linkedin', 'pack', 'mentor'] as const;

export type ProviderCode = (typeof PROVIDER_CODES)[number];

const LABELS: Record<ProviderCode, string> = {
	skilla: 'Skilla',
	linkedin: 'Linkedin',
	pack: 'Pack',
	mentor: 'Mentor'
};

/** Value object: who owns / produced the resource, from a closed list. */
export class Provider {
	private constructor(readonly code: ProviderCode) {}

	static create(raw: string): Provider {
		if (!Provider.isValid(raw)) {
			throw new DomainError('PROVIDER_INVALID', `Unknown provider "${raw}"`, 'provider');
		}
		return new Provider(raw);
	}

	static isValid(raw: string): raw is ProviderCode {
		return (PROVIDER_CODES as readonly string[]).includes(raw);
	}

	static all(): Provider[] {
		return PROVIDER_CODES.map((code) => new Provider(code));
	}

	get label(): string {
		return LABELS[this.code];
	}

	equals(other: Provider): boolean {
		return this.code === other.code;
	}
}
