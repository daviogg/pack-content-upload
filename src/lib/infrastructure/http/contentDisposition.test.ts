import { describe, expect, it } from 'vitest';
import { contentDisposition } from './contentDisposition';

describe('contentDisposition', () => {
	it('keeps plain ASCII names as they are', () => {
		expect(contentDisposition('inline', 'guide.pdf')).toBe(
			`inline; filename="guide.pdf"; filename*=UTF-8''guide.pdf`
		);
	});

	it('adds an ASCII fallback and a UTF-8 encoded name for non-ASCII characters', () => {
		expect(contentDisposition('attachment', 'guida sull\'ética "v2".pdf')).toBe(
			`attachment; filename="guida sull'_tica 'v2'.pdf"; filename*=UTF-8''guida%20sull'%C3%A9tica%20%22v2%22.pdf`
		);
	});
});
