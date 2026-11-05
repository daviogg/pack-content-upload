import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '../../application/ports/IdGenerator';

/** Adapter: random UUID v4 from the platform. */
export class UuidIdGenerator implements IdGenerator {
	next(): string {
		return randomUUID();
	}
}
