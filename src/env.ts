import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Every environment variable the app reads, declared once with its rule.
 * SvelteKit validates them at startup and exposes them, typed, from
 * `$app/env/private`. See .env.example for the documented values.
 */
function required(name: string) {
	return (value: string | undefined): string => {
		if (!value) throw new Error(`${name} is required`);
		return value;
	};
}

function optional(value: string | undefined): string | undefined {
	return value || undefined;
}

export const variables = defineEnvVars({
	DATABASE_URL: { schema: required('DATABASE_URL') },

	STORAGE_DRIVER: {
		schema: (value): 'local' | 's3' => {
			if (value === undefined || value === '' || value === 'local') return 'local';
			if (value === 's3') return 's3';
			throw new Error('STORAGE_DRIVER must be "local" or "s3"');
		}
	},
	LOCAL_STORAGE_DIR: { schema: (value) => value || './data/uploads' },

	S3_BUCKET: { schema: optional },
	S3_REGION: { schema: (value) => value || 'auto' },
	S3_ENDPOINT: { schema: optional },
	S3_ACCESS_KEY_ID: { schema: optional },
	S3_SECRET_ACCESS_KEY: { schema: optional }
});
