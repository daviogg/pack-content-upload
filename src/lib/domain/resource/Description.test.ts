import { describe, expect, it } from 'vitest';
import { Description } from './Description';
import { DomainError } from '../shared/DomainError';

describe('Description', () => {
	it('creates a trimmed description', () => {
		expect(Description.create('  step by step guide ').toString()).toBe('step by step guide');
	});

	it('rejects an empty description with a field-scoped error', () => {
		try {
			Description.create(' ');
		} catch (error) {
			expect(error).toBeInstanceOf(DomainError);
			expect((error as DomainError).code).toBe('DESCRIPTION_EMPTY');
			expect((error as DomainError).field).toBe('description');
		}
	});

	it('accepts exactly 1000 characters and rejects 1001', () => {
		expect(() => Description.create('a'.repeat(1000))).not.toThrow();
		expect(() => Description.create('a'.repeat(1001))).toThrow(/1000 characters/);
	});
});
