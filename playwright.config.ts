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
			// Same test database as the integration tests, never the development one
			DATABASE_URL:
				process.env.TEST_DATABASE_URL ?? 'postgres://pack:pack@localhost:5432/pack_test',
			STORAGE_DRIVER: 'local',
			LOCAL_STORAGE_DIR: './data/e2e-uploads',
			BODY_SIZE_LIMIT: '209715200',
			ADMIN_PASSWORD: 'e2e-admin' // see e2e/admin.e2e.ts
		}
	}
});
