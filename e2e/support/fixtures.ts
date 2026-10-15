import { randomUUID } from 'node:crypto';
import { test as base, expect } from '@playwright/test';
import { PrismaClient } from '@drpg/prisma';
import { DATABASE_URL, FRONT_URL, RELEASE_CHANNEL } from './env.js';

export type TestPlayer = {
	id: string;
	name: string;
	token: string;
};

type PlayerOptions = {
	tosAccepted?: boolean;
	money?: number;
};

type Fixtures = {
	db: PrismaClient;
	createPlayer: (options?: PlayerOptions) => Promise<TestPlayer>;
	/** A fresh player that has accepted the terms, with the browser already logged in as them. */
	player: TestPlayer;
	login: (player: TestPlayer) => Promise<void>;
};

export const test = base.extend<Fixtures, { workerDb: PrismaClient }>({
	workerDb: [
		async ({}, use) => {
			const db = new PrismaClient({ datasourceUrl: DATABASE_URL });
			await use(db);
			await db.$disconnect();
		},
		{ scope: 'worker' }
	],

	db: async ({ workerDb }, use) => {
		await use(workerDb);
	},

	// Same rows as the OAuth sign-up in ed-be/src/business/oauthService.ts, minus the Eternaltwin token.
	// Players are left in place: logs and fight archives do not cascade, and each test gets its own player anyway.
	createPlayer: async ({ db }, use) => {
		await use(async ({ tosAccepted = true, money = 1_000_000 } = {}) => {
			const id = randomUUID();
			const player = await db.player.create({
				data: {
					id,
					name: `e2e-${id.slice(0, 8)}`,
					money,
					quetzuBought: 0,
					tosAccepted,
					ranking: { create: {} }
				}
			});
			return { id: player.id, name: player.name, token: player.connexionToken };
		});
	},

	login: async ({ context }, use) => {
		await use(async player => {
			await context.addCookies([
				{ name: `x-drpg-${RELEASE_CHANNEL}-user`, value: player.id, url: FRONT_URL },
				{ name: `x-drpg-${RELEASE_CHANNEL}-token`, value: player.token, url: FRONT_URL }
			]);
		});
	},

	player: async ({ createPlayer, login }, use) => {
		const player = await createPlayer();
		await login(player);
		await use(player);
	}
});

export { expect };
