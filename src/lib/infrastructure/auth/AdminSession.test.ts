import { describe, expect, it } from 'vitest';
import { AdminSession } from './AdminSession';

const now = new Date('2026-11-08T12:00:00Z');
const session = new AdminSession('correct horse battery staple', 60_000);

describe('AdminSession', () => {
	it('accepts the configured password and rejects others', () => {
		expect(session.checkPassword('correct horse battery staple')).toBe(true);
		expect(session.checkPassword('correct horse battery stapl')).toBe(false);
		expect(session.checkPassword('')).toBe(false);
	});

	it('verifies a token it issued while it is valid', () => {
		const token = session.issue(now);
		expect(session.verify(token, now)).toBe(true);
		expect(session.verify(token, new Date(now.getTime() + 59_000))).toBe(true);
	});

	it('rejects an expired token', () => {
		const token = session.issue(now);
		expect(session.verify(token, new Date(now.getTime() + 60_000))).toBe(false);
	});

	it('rejects a tampered or malformed token', () => {
		const token = session.issue(now);
		const [expiresAt, signature] = token.split('.');
		expect(session.verify(`${Number(expiresAt) + 1}.${signature}`, now)).toBe(false);
		expect(session.verify(`${expiresAt}.${signature}x`, now)).toBe(false);
		expect(session.verify(`${expiresAt}`, now)).toBe(false);
		expect(session.verify(`${token}.extra`, now)).toBe(false);
		expect(session.verify('', now)).toBe(false);
		expect(session.verify(undefined, now)).toBe(false);
	});

	it('rejects a token signed with another secret', () => {
		const other = new AdminSession('another secret', 60_000);
		expect(session.verify(other.issue(now), now)).toBe(false);
	});

	it('refuses an empty secret', () => {
		expect(() => new AdminSession('')).toThrowError();
	});
});
