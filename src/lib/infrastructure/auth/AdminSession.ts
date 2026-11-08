import { createHmac, timingSafeEqual } from 'node:crypto';

/** Name of the cookie that carries the admin session token. */
export const ADMIN_COOKIE = 'admin_session';

const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * Single-administrator access guarded by one shared secret (ADMIN_PASSWORD).
 *
 * Logging in means proving the password; the proof is then carried by a
 * stateless token `<expiry>.<hmac(expiry)>` signed with the same secret, so
 * no session table is needed and a restart does not log anyone out.
 * The password is never stored in the cookie, only a signature derived from it.
 */
export class AdminSession {
	constructor(
		private readonly secret: string,
		private readonly ttlMs: number = DEFAULT_TTL_MS
	) {
		if (secret.length === 0) throw new Error('AdminSession needs a non-empty secret');
	}

	/** Constant-time comparison so response timing does not leak how many characters matched. */
	checkPassword(candidate: string): boolean {
		return safeEqual(this.sign(candidate), this.sign(this.secret));
	}

	/** Issues a token valid for `ttlMs` from `now`. */
	issue(now: Date): string {
		const expiresAt = String(now.getTime() + this.ttlMs);
		return `${expiresAt}.${this.sign(expiresAt)}`;
	}

	/** True only for a token we signed that has not expired. */
	verify(token: string | undefined, now: Date): boolean {
		if (!token) return false;
		const [expiresAt, signature, extra] = token.split('.');
		if (!expiresAt || !signature || extra !== undefined) return false;
		if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= now.getTime()) return false;
		return safeEqual(signature, this.sign(expiresAt));
	}

	private sign(value: string): string {
		return createHmac('sha256', this.secret).update(value).digest('base64url');
	}
}

function safeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
