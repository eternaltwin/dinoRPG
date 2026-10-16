import { defineConfig, devices } from '@playwright/test';
import { API_URL, BACKEND_ENV, FRONT_URL, FRONTEND_ENV } from './support/env.js';

const CI = !!process.env.CI;

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: CI,
	retries: CI ? 2 : 0,
	// The Vite dev server serves the app unbundled: more parallel pages make cold loads time out.
	workers: 2,
	// The Vite dev server transforms modules on first request, which is slow on a cold CI runner.
	expect: { timeout: CI ? 15_000 : 5_000 },
	reporter: CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'on-failure' }]],
	use: {
		baseURL: FRONT_URL,
		locale: 'fr-FR',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	// Never reuse running servers: a `yarn dev` stack talks to the dev database, not dinorpg_e2e.
	webServer: [
		{
			name: 'back',
			// Requires a built backend (`yarn build:back`).
			command: 'yarn prisma migrate deploy && node dist/main.js',
			cwd: '../ed-be',
			env: BACKEND_ENV,
			url: `${API_URL}/api/v1/news/page/1`,
			reuseExistingServer: false,
			timeout: 120_000,
			stdout: 'pipe'
		},
		{
			name: 'front',
			// Development mode keeps the dev game config and the ws://localhost:8082 WebSocket URL.
			command: 'yarn vite --mode development --port 8080 --strictPort',
			cwd: '../ed-ui',
			env: FRONTEND_ENV,
			url: FRONT_URL,
			reuseExistingServer: false,
			timeout: 120_000
		}
	]
});
