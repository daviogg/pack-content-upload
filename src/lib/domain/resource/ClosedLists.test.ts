import { describe, expect, it } from 'vitest';
import { Category } from './Category';
import { Provider } from './Provider';
import { Roles } from './Roles';
import { DomainError } from '../shared/DomainError';

describe('Category', () => {
	it('creates from a known code and exposes a label', () => {
		expect(Category.create('conflict-resolution').label).toBe('Conflict Resolution');
	});

	it('rejects unknown codes with a field-scoped error', () => {
		expect(() => Category.create('cooking')).toThrowError(DomainError);
		try {
			Category.create('cooking');
		} catch (error) {
			expect((error as DomainError).field).toBe('category');
		}
	});

	it('lists all categories without duplicates', () => {
		const codes = Category.all().map((c) => c.code);
		expect(new Set(codes).size).toBe(codes.length);
		expect(codes).toContain('leadership');
	});
});

describe('Provider', () => {
	it('creates from a known code', () => {
		expect(Provider.create('pack').label).toBe('Pack');
	});

	it('rejects unknown codes', () => {
		expect(() => Provider.create('youtube')).toThrow(/Unknown provider/);
	});
});

describe('Roles', () => {
	it('requires at least one role', () => {
		expect(() => Roles.create([])).toThrowError(DomainError);
		try {
			Roles.create([]);
		} catch (error) {
			expect((error as DomainError).code).toBe('ROLES_EMPTY');
			expect((error as DomainError).field).toBe('roles');
		}
	});

	it('de-duplicates and orders canonically', () => {
		const a = Roles.create(['mentee', 'mentor']);
		const b = Roles.create(['mentor', 'mentor', 'mentee']);
		expect(a.toArray()).toEqual(['mentor', 'mentee']);
		expect(a.equals(b)).toBe(true);
	});

	it('rejects unknown role codes', () => {
		expect(() => Roles.create(['mentor', 'admin'])).toThrowError(DomainError);
	});

	it('answers membership queries', () => {
		const roles = Roles.create(['mentee']);
		expect(roles.has('mentee')).toBe(true);
		expect(roles.has('mentor')).toBe(false);
	});

	it('exposes options for the UI', () => {
		expect(Roles.options()).toEqual([
			{ code: 'mentor', label: 'Mentor / Coach' },
			{ code: 'mentee', label: 'Mentee / Coachee' }
		]);
	});
});
