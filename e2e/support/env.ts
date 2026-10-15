import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';

export const FRONT_URL = 'http://localhost:8080';
export const API_URL = 'http://localhost:8081';
export const RELEASE_CHANNEL = 'e2e';

/**
 * Database used by the e2e backend. `E2E_DATABASE_URL` wins (CI); otherwise the dev `DATABASE_URL`
 * from ed-be/.env is reused with its database swapped for `dinorpg_e2e`, so local credentials are not duplicated.
 */
function resolveDatabaseUrl(): string {
	if (process.env.E2E_DATABASE_URL) {
		return process.env.E2E_DATABASE_URL;
	}
	let devEnv: Record<string, string> = {};
	try {
		devEnv = parse(readFileSync(fileURLToPath(new URL('../../ed-be/.env', import.meta.url))));
	} catch {
		// No ed-be/.env: fall through to the error below.
	}
	if (!devEnv.DATABASE_URL) {
		throw new Error('Set E2E_DATABASE_URL, or DATABASE_URL in ed-be/.env, to reach the dinorpg_e2e database');
	}
	const url = new URL(devEnv.DATABASE_URL);
	url.pathname = '/dinorpg_e2e';
	return url.toString();
}

export const DATABASE_URL = resolveDatabaseUrl();

/**
 * Backend environment. ed-be still loads its own .env (cwd) and Prisma loads it too, but neither overrides
 * variables that are already set: every value that must not leak from the dev setup is pinned here,
 * empty Discord webhooks included.
 */
export const BACKEND_ENV: Record<string, string> = {
	NODE_ENV: 'development',
	DATABASE_URL,
	PORT: '8081',
	WSS_PORT: '8082',
	SELF_URL: FRONT_URL,
	// Dummy 32-byte key, test data only.
	DUNGEON_KEY: '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
	SALT: 'e2e-salt',
	// No Eternaltwin in e2e: point it at a closed port so any outgoing call fails fast.
	ETERNALTWIN_URL: 'http://127.0.0.1:9/',
	ETERNALTWIN_PUBLIC_URL: 'http://127.0.0.1:9/',
	ADMIN: '00000000-0000-4000-8000-000000000000',
	DISCORD_PANTHEON_WEBHOOK_ID: '',
	DISCORD_PANTHEON_WEBHOOK_TOKEN: '',
	DISCORD_NEWS_WEBHOOK_ID: '',
	DISCORD_NEWS_WEBHOOK_TOKEN: '',
	DISCORD_LOGS_WEBHOOK_ID: '',
	DISCORD_LOGS_WEBHOOK_TOKEN: ''
};

/** Vite gives variables already in the environment priority over ed-ui/.env.* files. */
export const FRONTEND_ENV: Record<string, string> = {
	VITE_API_URL: API_URL,
	VITE_API_RELEASE_CHANNEL: RELEASE_CHANNEL,
	VITE_API_RELEASE_COMMIT: 'e2e',
	VITE_USE_HTTPS: 'false'
};
