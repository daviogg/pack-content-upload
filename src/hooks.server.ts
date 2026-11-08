import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { ADMIN_COOKIE } from '#lib/infrastructure/auth/AdminSession.ts';
import { container } from '#lib/infrastructure/container.ts';

/** Runs once when the server starts: bring the database schema up to date. */
export const init: ServerInit = async () => {
	await container.migrate();
};

/** Runs on every request: turn the signed admin cookie into `locals.isAdmin`. */
export const handle: Handle = async ({ event, resolve }) => {
	const session = container.adminSession;
	event.locals.isAdmin = session?.verify(event.cookies.get(ADMIN_COOKIE), new Date()) ?? false;
	return resolve(event);
};
