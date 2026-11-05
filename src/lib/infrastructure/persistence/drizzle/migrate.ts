import { migrate } from 'drizzle-orm/postgres-js/migrator';
import type { Database } from './client';

/**
 * Applies every migration in ./drizzle that is not yet recorded in the
 * `__drizzle_migrations` table. Idempotent: safe to run on each start.
 */
export async function runMigrations(db: Database): Promise<void> {
	await migrate(db, { migrationsFolder: 'drizzle' });
}
