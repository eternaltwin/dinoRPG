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
				'src/business/adminService.ts'
			]
		}
	}
});
