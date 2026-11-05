/** Port: source of the current time, so use cases are deterministic in tests. */
export interface Clock {
	now(): Date;
}
