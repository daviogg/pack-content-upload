import type { Clock } from '../../application/ports/Clock';

/** Test double: always returns the same instant. */
export class FixedClock implements Clock {
	constructor(private readonly instant: Date = new Date('2026-11-05T10:00:00Z')) {}

	now(): Date {
		return new Date(this.instant);
	}
}
