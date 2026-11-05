/** Port: produces new unique ids (UUID v4 strings). */
export interface IdGenerator {
	next(): string;
}
