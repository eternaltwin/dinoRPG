import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/test/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reportsDirectory: './coverage',
			include: ['src/**/*.ts'],
			exclude: [
				'src/**/*.test.ts',
				'src/test/**',
				'src/routes/**',
				'src/middleware/**',
				'src/logger/**',
				'src/constants/**',
				'src/*.ts',
				'src/helps/**',
				'src/utils/server/**',
				'src/utils/helpers/**',
				'src/business/adminService.ts',
				// Persistence and scheduling layers are integration boundaries: DAOs are thin
				// Prisma wrappers (always mocked in unit tests) and cron jobs orchestrate them on
				// a timer. They are excluded from unit coverage, consistent with routes/middleware.
				'src/dao/**',
				'src/cron/**'
			]
		}
	}
});
