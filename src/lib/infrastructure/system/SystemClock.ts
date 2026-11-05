import type { Clock } from '../../application/ports/Clock';

/** Adapter: the real wall clock. */
export class SystemClock implements Clock {
	now(): Date {
		return new Date();
	}
}
