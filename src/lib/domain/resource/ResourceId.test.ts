import { describe, expect, it } from 'vitest';
import { ResourceId } from './ResourceId';
import { DomainError } from '../shared/DomainError';

describe('ResourceId', () => {
	const uuid = '6f1c2a3e-9b4d-4c5e-8f7a-1b2c3d4e5f60';

	it('accepts a UUID and normalizes it to lower case', () => {
		expect(ResourceId.create(uuid.toUpperCase()).toString()).toBe(uuid);
	});

	it('rejects anything that is not a UUID', () => {
		expect(() => ResourceId.create('123')).toThrowError(DomainError);
		expect(() => ResourceId.create('')).toThrowError(DomainError);
	});

	it('compares by value', () => {
		expect(ResourceId.create(uuid).equals(ResourceId.create(uuid))).toBe(true);
	});
});
