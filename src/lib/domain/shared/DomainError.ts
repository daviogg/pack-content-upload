/**
 * Base error for every rule violation inside the domain.
 *
 * `code` is a stable, machine-readable identifier (e.g. "TITLE_TOO_LONG")
 * so adapters (UI, API) can map it to a localized message without parsing text.
 * `field` optionally names the input that caused the violation, which lets a
 * form adapter attach the error to the right input.
 */
export class DomainError extends Error {
	constructor(
		public readonly code: string,
		message: string,
		public readonly field?: string
	) {
		super(message);
		this.name = 'DomainError';
	}
}
