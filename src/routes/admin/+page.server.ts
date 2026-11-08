import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_COOKIE } from '#lib/infrastructure/auth/AdminSession.ts';
import { container } from '#lib/infrastructure/container.ts';

const COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60;

/** Admin login. Already logged in → nothing to do here. */
export const load: PageServerLoad = ({ locals }) => {
	if (locals.isAdmin) redirect(303, '/');
	return { configured: container.adminSession !== null };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const session = container.adminSession;
		if (!session) return fail(503, { message: 'Admin access is not configured on this server' });

		const password = (await request.formData()).get('password');
		if (typeof password !== 'string' || !session.checkPassword(password)) {
			return fail(401, { message: 'Wrong password' });
		}

		cookies.set(ADMIN_COOKIE, session.issue(new Date()), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: COOKIE_MAX_AGE_SECONDS
		});
		redirect(303, '/');
	},

	logout: ({ cookies }) => {
		cookies.delete(ADMIN_COOKIE, { path: '/' });
		redirect(303, '/');
	}
};
