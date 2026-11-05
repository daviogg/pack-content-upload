import { describe, expect, it } from 'vitest';
import { Language } from './Language';
import { DomainError } from '../shared/DomainError';

describe('Language', () => {
	it('creates a language from a supported code', () => {
		const language = Language.create('it');
		expect(language.code).toBe('it');
		expect(language.label).toBe('Italian');
	});

	it('rejects unknown codes', () => {
		expect(() => Language.create('xx')).toThrowError(DomainError);
		expect(() => Language.create('EN')).toThrow(/Unknown language/);
	});

	it('lists every supported language once', () => {
		const codes = Language.all().map((l) => l.code);
		expect(codes).toEqual(['en', 'it', 'es', 'fr', 'de', 'pt']);
		expect(new Set(codes).size).toBe(codes.length);
	});
});
