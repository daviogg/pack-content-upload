import { defineConfig } from '@playwright/test';

const port = 4173;
const origin = `http://localhost:${port}`;

/**
 * End-to-end tests run against the production build (adapter-node), not the
 * dev server, so they exercise the same thing we ship: CSRF origin, body size
 * limit, migrations at startup. They need the Postgres from docker compose.
 */
export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.{ts,js}',
	use: { baseURL: origin },
	webServer: {
		command: 'npm run build && node build',
		url: origin,
		reuseExistingServer: !process.env.CI,
		env: {
			PORT: String(port),
			ORIGIN: origin, // baked into the build for the CSRF check on form posts
			DATABASE_URL: process.env.DATABASE_URL ?? 'postgres://pack:pack@localhost:5432/pack',
			STORAGE_DRIVER: 'local',
			LOCAL_STORAGE_DIR: './data/e2e-uploads',
			BODY_SIZE_LIMIT: '209715200'
		}
	}
});
