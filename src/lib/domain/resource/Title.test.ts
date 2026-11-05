import { describe, expect, it } from 'vitest';
import { Title } from './Title';
import { DomainError } from '../shared/DomainError';

describe('Title', () => {
	it('creates a trimmed title', () => {
		const title = Title.create('  How to deal with conflict  ');
		expect(title.toString()).toBe('How to deal with conflict');
	});

	it('rejects an empty or whitespace-only title', () => {
		expect(() => Title.create('   ')).toThrowError(DomainError);
		expect(() => Title.create('')).toThrow(/required/);
	});

	it('accepts exactly 200 characters and rejects 201', () => {
		expect(() => Title.create('a'.repeat(200))).not.toThrow();
		expect(() => Title.create('a'.repeat(201))).toThrow(/200 characters/);
	});

	it('exposes a stable error code and field name', () => {
		try {
			Title.create('a'.repeat(201));
		} catch (error) {
			expect(error).toBeInstanceOf(DomainError);
			expect((error as DomainError).code).toBe('TITLE_TOO_LONG');
			expect((error as DomainError).field).toBe('title');
		}
	});

	it('compares by value', () => {
		expect(Title.create('A').equals(Title.create('A'))).toBe(true);
		expect(Title.create('A').equals(Title.create('B'))).toBe(false);
	});
});
