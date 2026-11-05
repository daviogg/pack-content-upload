import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/** Opens a connection pool and wraps it with Drizzle. One per process. */
export function createDatabase(url: string) {
	// onnotice: Postgres NOTICEs (e.g. "schema already exists") are not errors; keep logs clean.
	const sql = postgres(url, { max: 10, onnotice: () => {} });
	return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDatabase>;
