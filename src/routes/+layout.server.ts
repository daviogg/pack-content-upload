import type { LayoutServerLoad } from './$types';

/** Exposes the admin flag to every page so the UI can show or hide admin actions. */
export const load: LayoutServerLoad = ({ locals }) => {
	return { isAdmin: locals.isAdmin };
};
