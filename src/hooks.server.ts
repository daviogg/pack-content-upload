import type { ServerInit } from '@sveltejs/kit/hooks';
import { container } from '#lib/infrastructure/container.ts';

/** Runs once when the server starts: bring the database schema up to date. */
export const init: ServerInit = async () => {
	await container.migrate();
};
