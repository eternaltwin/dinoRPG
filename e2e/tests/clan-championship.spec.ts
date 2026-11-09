import { expect, test } from '../support/fixtures.js';
import { FRONT_URL, RELEASE_CHANNEL } from '../support/env.js';

const PLACE_ID = 5; // PlaceEnum.DINOVILLE
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

// The backend serves a single active championship: tests creating one must not run in parallel workers.
test.describe.configure({ mode: 'serial' });

test('a clan leader enters the board and moves a piece in a live championship match', async ({
	page,
	player,
	createPlayer,
	db
}) => {
	// Long scenario: over the default timeout when the Vite dev server is still cold
	test.setTimeout(60_000);
	const suffix = player.id.slice(0, 8);
	// Dinoz sheets need the weekly itinerant merchant place, normally set by a cron job.
	const hadItinerant = (await db.secret.findUnique({ where: { key: 'itinerant' } })) !== null;
	if (!hadItinerant) await db.secret.create({ data: { key: 'itinerant', value: String(PLACE_ID) } });
	const rival = await createPlayer();
	const clanA = await db.clan.create({ data: { name: `e2e-A-${suffix}`, leaderId: player.id } });
	const clanB = await db.clan.create({ data: { name: `e2e-B-${suffix}`, leaderId: rival.id } });
	await db.clanMember.create({ data: { clanId: clanA.id, playerId: player.id, rights: [] } });
	await db.clanMember.create({ data: { clanId: clanB.id, playerId: rival.id, rights: [] } });
	await db.player.update({ where: { id: player.id }, data: { clanId: clanA.id } });
	await db.player.update({ where: { id: rival.id }, data: { clanId: clanB.id } });

	const dinoz = await db.dinoz.create({
		data: {
			name: `Dino${suffix}`,
			raceId: 1,
			level: 1,
			nextUpElementId: 1,
			nextUpAltElementId: 2,
			placeId: PLACE_ID,
			canChangeName: false,
			display: 'A093Rmo7JM3f2000',
			life: 100,
			maxLife: 100,
			experience: 0,
			nbrUpFire: 0,
			nbrUpWood: 0,
			nbrUpWater: 0,
			nbrUpLightning: 0,
			nbrUpAir: 0,
			playerId: player.id
		}
	});

	// The backend tick runs at boot and every 10 minutes: the match started 5 minutes ago (no tick due yet)
	// and ends in 2 days, so it is left alone for the whole test.
	const now = Date.now();
	const event = await db.clanEvent.create({
		data: {
			eventType: 'championship',
			startDate: new Date(now - DAY),
			endDate: new Date(now + 7 * DAY),
			config: JSON.stringify({
				eventType: 'championship',
				places: [PLACE_ID],
				registrationEnd: new Date(now - 2 * 60 * MINUTE).toISOString(),
				phase: 'running'
			})
		}
	});
	const match = await db.clanChampionshipMatch.create({
		data: {
			eventId: event.id,
			round: 0,
			homeClanId: clanA.id,
			awayClanId: clanB.id,
			homeClanName: clanA.name,
			awayClanName: clanB.name,
			startsAt: new Date(now - 5 * MINUTE),
			endsAt: new Date(now + 2 * DAY),
			placeId: PLACE_ID,
			westClanId: clanA.id,
			obstacles: [],
			status: 'live',
			ticksApplied: 0,
			version: 0
		}
	});

	try {
		await page.goto(`/clan/${clanA.id}/championship/match`);

		const names = page.getByTestId('clan-name');
		await expect(names).toHaveText([clanA.name, clanB.name]);

		await page.getByTestId(`enter-${dinoz.id}`).click();
		await expect(page.getByTestId('board-piece')).toHaveCount(1);

		const piece = await db.clanChampionshipPiece.findFirstOrThrow({ where: { matchId: match.id } });
		expect(piece).toMatchObject({ dinozId: dinoz.id, state: 'onBoard', x: 0, clanId: clanA.id });
		const locked = await db.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } });
		expect(locked.unavailableReason).toBe('clanChampionship');
		const y = piece.y as number;
		await expect(page.getByTestId(`board-cell-0-${y}`).getByTestId('board-piece')).toBeVisible();

		// Skip the 10-minute tick: give the piece its action points directly, then refetch the board.
		await db.clanChampionshipPiece.update({ where: { id: piece.id }, data: { actionPoints: 2 } });
		await page.reload();
		await expect(page.getByTestId(`board-cell-0-${y}`).getByTestId('board-piece')).toBeVisible();

		// The full page loader blocks the clicks: selecting and moving must never turn it on
		await page.evaluate(() => {
			const app = (document.querySelector('#app') as unknown as { __vue_app__: any }).__vue_app__;
			const win = window as unknown as { loaderCalls: number };
			win.loaderCalls = 0;
			app.config.globalProperties.$pinia._s.get('loading').$onAction(({ name }: { name: string }) => {
				if (name === 'setLoaderOn') win.loaderCalls++;
			});
		});
		const fiche = page.waitForResponse(response => response.url().includes(`/dinoz/fiche/${dinoz.id}`));

		await page.getByTestId(`board-cell-0-${y}`).click();
		await page.getByTestId(`board-cell-1-${y}`).click();

		// The dinoz sheet is still refreshed after the move, silently
		await fiche;
		await page.waitForLoadState('networkidle');
		expect(await page.evaluate(() => (window as unknown as { loaderCalls: number }).loaderCalls)).toBe(0);

		await expect(page.getByTestId(`board-cell-1-${y}`).getByTestId('board-piece')).toBeVisible();
		await expect
			.poll(async () => (await db.clanChampionshipPiece.findUniqueOrThrow({ where: { id: piece.id } })).x)
			.toBe(1);
		const moved = await db.clanChampionshipPiece.findUniqueOrThrow({ where: { id: piece.id } });
		expect(moved).toMatchObject({ x: 1, y, actionPoints: 1 });
	} finally {
		if (!hadItinerant) await db.secret.deleteMany({ where: { key: 'itinerant' } });
		// Pieces and matches cascade from the event; clans and players are left to the unique names.
		await db.clanEvent.delete({ where: { id: event.id } });
		await db.dinoz.deleteMany({ where: { playerId: player.id } });
		await db.player.updateMany({ where: { id: { in: [player.id, rival.id] } }, data: { clanId: null } });
		await db.clanMember.deleteMany({ where: { clanId: { in: [clanA.id, clanB.id] } } });
		await db.clan.deleteMany({ where: { id: { in: [clanA.id, clanB.id] } } });
	}
});

test('the selected piece shows its equipment and inventory, and can be healed and equipped from the board', async ({
	page,
	player,
	createPlayer,
	db
}) => {
	const CLOUD_BURGER = 3;
	const POTION_IRMA = 1;
	const suffix = player.id.slice(0, 8);
	const hadItinerant = (await db.secret.findUnique({ where: { key: 'itinerant' } })) !== null;
	if (!hadItinerant) await db.secret.create({ data: { key: 'itinerant', value: String(PLACE_ID) } });
	const rival = await createPlayer();
	const clanA = await db.clan.create({ data: { name: `e2e-A-${suffix}`, leaderId: player.id } });
	const clanB = await db.clan.create({ data: { name: `e2e-B-${suffix}`, leaderId: rival.id } });
	await db.clanMember.create({ data: { clanId: clanA.id, playerId: player.id, rights: [] } });
	await db.clanMember.create({ data: { clanId: clanB.id, playerId: rival.id, rights: [] } });
	await db.player.update({ where: { id: player.id }, data: { clanId: clanA.id } });
	await db.player.update({ where: { id: rival.id }, data: { clanId: clanB.id } });
	await db.playerItem.createMany({
		data: [
			{ playerId: player.id, itemId: CLOUD_BURGER, quantity: 3 },
			{ playerId: player.id, itemId: POTION_IRMA, quantity: 1 }
		]
	});

	const dinozData = {
		raceId: 1,
		level: 1,
		nextUpElementId: 1,
		nextUpAltElementId: 2,
		canChangeName: false,
		display: 'A093Rmo7JM3f2000',
		maxLife: 100,
		experience: 0,
		nbrUpFire: 0,
		nbrUpWood: 0,
		nbrUpWater: 0,
		nbrUpLightning: 0,
		nbrUpAir: 0,
		playerId: player.id
	};
	// Created first and without any item: it is the default dinoz, the panel must not fall back on it.
	await db.dinoz.create({ data: { ...dinozData, name: `Other${suffix}`, placeId: PLACE_ID + 1, life: 100 } });
	const dinoz = await db.dinoz.create({
		data: {
			...dinozData,
			name: `Dino${suffix}`,
			placeId: PLACE_ID,
			life: 50,
			items: { create: { itemId: CLOUD_BURGER } }
		}
	});

	const now = Date.now();
	const event = await db.clanEvent.create({
		data: {
			eventType: 'championship',
			startDate: new Date(now - DAY),
			endDate: new Date(now + 7 * DAY),
			config: JSON.stringify({
				eventType: 'championship',
				places: [PLACE_ID],
				registrationEnd: new Date(now - 2 * 60 * MINUTE).toISOString(),
				phase: 'running'
			})
		}
	});
	const match = await db.clanChampionshipMatch.create({
		data: {
			eventId: event.id,
			round: 0,
			homeClanId: clanA.id,
			awayClanId: clanB.id,
			homeClanName: clanA.name,
			awayClanName: clanB.name,
			startsAt: new Date(now - 5 * MINUTE),
			endsAt: new Date(now + 2 * DAY),
			placeId: PLACE_ID,
			westClanId: clanA.id,
			obstacles: [],
			status: 'live',
			ticksApplied: 0,
			version: 0
		}
	});

	try {
		await page.goto(`/clan/${clanA.id}/championship/match`);
		await page.getByTestId(`enter-${dinoz.id}`).click();
		await expect(page.getByTestId('board-piece')).toHaveCount(1);

		// A piece without action points cannot be selected on the board, but it can still be healed from the list
		await page.locator('.cdc-tabs li.clickable', { hasText: dinoz.name }).click();

		const hp = page.getByTestId('selection-hp');
		await expect(hp).toContainText('50/100');
		// The ":pv:" label is rendered as the icon, not as its HTML source
		await expect(hp.locator('img')).toHaveCount(1);
		const equipped = page.locator('.equip img[alt="cloud_burger"]');
		await expect(equipped).toHaveCount(1);

		// A dinoz locked on the board can only be healed: other items stay disabled
		const inventory = page.getByTestId('selection-inventory');
		await expect(inventory.getByTestId(`use-item-${CLOUD_BURGER}`)).toBeVisible();
		await expect(inventory.getByTestId(`use-item-${POTION_IRMA}`)).toHaveCount(0);

		await inventory.getByTestId(`use-item-${CLOUD_BURGER}`).click();
		await page.getByTestId('confirm-accept').click();
		await expect(hp).toContainText('60/100');
		expect((await db.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } })).life).toBe(60);

		await inventory.getByTestId(`equip-item-${CLOUD_BURGER}`).click();
		await expect(equipped).toHaveCount(2);
		expect(await db.dinozItem.count({ where: { dinozId: dinoz.id } })).toBe(2);

		await equipped.first().click();
		await expect(equipped).toHaveCount(1);
		await expect.poll(() => db.dinozItem.count({ where: { dinozId: dinoz.id } })).toBe(1);
	} finally {
		if (!hadItinerant) await db.secret.deleteMany({ where: { key: 'itinerant' } });
		await db.clanEvent.delete({ where: { id: event.id } });
		await db.dinoz.deleteMany({ where: { playerId: player.id } });
		await db.player.updateMany({ where: { id: { in: [player.id, rival.id] } }, data: { clanId: null } });
		await db.clanMember.deleteMany({ where: { clanId: { in: [clanA.id, clanB.id] } } });
		await db.clan.deleteMany({ where: { id: { in: [clanA.id, clanB.id] } } });
	}
});

test('the board page lets the player navigate to another view', async ({ page, player, db }) => {
	const clan = await db.clan.create({ data: { name: `e2e-nav-${player.id.slice(0, 8)}`, leaderId: player.id } });
	await db.clanMember.create({ data: { clanId: clan.id, playerId: player.id, rights: [] } });
	await db.player.update({ where: { id: player.id }, data: { clanId: clan.id } });

	try {
		await page.goto(`/clan/${clan.id}/championship/match`);
		await expect(page.locator('.championship-match')).toBeVisible();
		await page.waitForLoadState('networkidle');

		// Client-side navigation: a full page load would not run the leave of the mounted board page
		await page.evaluate(async () => {
			const app = (document.querySelector('#app') as unknown as { __vue_app__: any }).__vue_app__;
			await app.config.globalProperties.$router.push('/help');
		});

		await expect(page).toHaveURL(/\/help$/);
		await expect(page.locator('.championship-match')).toHaveCount(0);
		// The redirect was asynchronous: make sure the URL stays on the requested view
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveURL(/\/help$/);
	} finally {
		await db.player.update({ where: { id: player.id }, data: { clanId: null } });
		await db.clanMember.deleteMany({ where: { clanId: clan.id } });
		await db.clan.delete({ where: { id: clan.id } });
	}
});

test('the championship shows the next match on the clan page and the standings in the clan ranking', async ({
	page,
	player,
	createPlayer,
	db
}) => {
	const suffix = player.id.slice(0, 8);
	const rival = await createPlayer();
	const clanA = await db.clan.create({ data: { name: `e2e-A-${suffix}`, leaderId: player.id } });
	const clanB = await db.clan.create({ data: { name: `e2e-B-${suffix}`, leaderId: rival.id } });
	await db.clanMember.create({ data: { clanId: clanA.id, playerId: player.id, rights: [] } });
	await db.clanMember.create({ data: { clanId: clanB.id, playerId: rival.id, rights: [] } });
	await db.player.update({ where: { id: player.id }, data: { clanId: clanA.id } });
	await db.player.update({ where: { id: rival.id }, data: { clanId: clanB.id } });

	const now = Date.now();
	const event = await db.clanEvent.create({
		data: {
			eventType: 'championship',
			startDate: new Date(now - 3 * DAY),
			endDate: new Date(now + 7 * DAY),
			config: JSON.stringify({
				eventType: 'championship',
				places: [PLACE_ID],
				registrationEnd: new Date(now - 2 * DAY).toISOString(),
				phase: 'running'
			})
		}
	});
	const base = {
		eventId: event.id,
		homeClanId: clanA.id,
		awayClanId: clanB.id,
		homeClanName: clanA.name,
		awayClanName: clanB.name,
		placeId: PLACE_ID,
		westClanId: clanA.id,
		obstacles: [],
		ticksApplied: 0,
		version: 0
	};
	await db.clanChampionshipMatch.create({
		data: {
			...base,
			round: 0,
			startsAt: new Date(now - 2 * DAY),
			endsAt: new Date(now - DAY),
			status: 'finished',
			homeScore: 12,
			awayScore: 3,
			winnerClanId: clanA.id
		}
	});
	await db.clanChampionshipMatch.create({
		data: { ...base, round: 1, startsAt: new Date(now + DAY), endsAt: new Date(now + 2 * DAY), status: 'scheduled' }
	});

	try {
		await page.goto(`/clan/${clanA.id}/championship`);

		const next = page.getByTestId('next-match');
		await expect(next).toContainText(clanB.name);
		await expect(next).toContainText('Lieu du match : Dinoville');

		await expect(page.getByText('Terminé', { exact: true })).toBeVisible();
		await expect(page.getByText('12 – 3')).toBeVisible();

		// The standings moved to the clan ranking, championship tab
		await page.goto('/ranking/clans?type=championship');
		const standings = page.getByTestId('standings');
		await expect(standings.getByRole('row').filter({ hasText: clanA.name }).getByRole('cell').last()).toHaveText('3');
		await expect(standings.getByRole('row').filter({ hasText: clanB.name }).getByRole('cell').last()).toHaveText('0');
	} finally {
		await db.clanEvent.delete({ where: { id: event.id } });
		await db.player.updateMany({ where: { id: { in: [player.id, rival.id] } }, data: { clanId: null } });
		await db.clanMember.deleteMany({ where: { clanId: { in: [clanA.id, clanB.id] } } });
		await db.clan.deleteMany({ where: { id: { in: [clanA.id, clanB.id] } } });
	}
});

test('the register button appears for the clan leader once an admin has opened registrations', async ({
	page,
	player,
	db
}) => {
	const suffix = player.id.slice(0, 8);
	const clan = await db.clan.create({ data: { name: `e2e-R-${suffix}`, leaderId: player.id } });
	await db.clanMember.create({ data: { clanId: clan.id, playerId: player.id, rights: [] } });
	await db.player.update({ where: { id: player.id }, data: { clanId: clan.id } });

	const now = Date.now();
	const event = await db.clanEvent.create({
		data: {
			eventType: 'championship',
			startDate: new Date(now + 3 * DAY),
			endDate: new Date(now + 17 * DAY),
			config: JSON.stringify({
				eventType: 'championship',
				places: [PLACE_ID],
				registrationEnd: new Date(now + 17 * DAY).toISOString(),
				phase: 'registration'
			})
		}
	});

	try {
		await page.goto(`/clan/${clan.id}/championship`);
		await expect(page.getByText('Inscriptions ouvertes à partir du')).toBeVisible();
		await expect(page.getByText('Inscrire le clan', { exact: true })).toHaveCount(0);

		// What the admin "open registrations now" action does.
		await db.clanEvent.update({ where: { id: event.id }, data: { startDate: new Date(now - MINUTE) } });
		await page.reload();
		await expect(page.getByText('Inscrire le clan', { exact: true })).toBeVisible();
	} finally {
		await db.clanEvent.delete({ where: { id: event.id } });
		await db.player.updateMany({ where: { id: player.id }, data: { clanId: null } });
		await db.clanMember.deleteMany({ where: { clanId: clan.id } });
		await db.clan.deleteMany({ where: { id: clan.id } });
	}
});

test('the clan socket opens as soon as a clan member is logged in, on any page', async ({ page, player, db }) => {
	const clan = await db.clan.create({ data: { name: `e2e-S-${player.id.slice(0, 8)}`, leaderId: player.id } });
	await db.clanMember.create({ data: { clanId: clan.id, playerId: player.id, rights: [] } });
	await db.player.update({ where: { id: player.id }, data: { clanId: clan.id } });

	const ready = new Promise<void>(resolve => {
		page.on('websocket', socket => {
			socket.on('framereceived', frame => {
				if (String(frame.payload).includes('"ready"')) resolve();
			});
		});
	});
	await page.goto('/');
	await ready;
});

test('a player without a clan has no clan socket', async ({ page, player }) => {
	void player;
	const sockets: string[] = [];
	page.on('websocket', socket => {
		// Vite's own hot reload socket does not count
		if (socket.url().includes('ticket=')) sockets.push(socket.url());
	});
	await page.goto('/');
	await page.waitForTimeout(2000);
	expect(sockets).toEqual([]);
});

test('clan members talk in real time in the chat tab of the board', async ({
	page,
	player,
	createPlayer,
	browser,
	db
}) => {
	test.setTimeout(60_000);
	const suffix = player.id.slice(0, 8);
	const mate = await createPlayer();
	const rival = await createPlayer();
	const clanA = await db.clan.create({ data: { name: `e2e-CA-${suffix}`, leaderId: player.id } });
	const clanB = await db.clan.create({ data: { name: `e2e-CB-${suffix}`, leaderId: rival.id } });
	for (const [clanId, playerId] of [
		[clanA.id, player.id],
		[clanA.id, mate.id],
		[clanB.id, rival.id]
	] as const) {
		await db.clanMember.create({ data: { clanId, playerId, rights: [] } });
		await db.player.update({ where: { id: playerId }, data: { clanId } });
	}
	const now = Date.now();
	const event = await db.clanEvent.create({
		data: {
			eventType: 'championship',
			startDate: new Date(now - DAY),
			endDate: new Date(now + 7 * DAY),
			config: JSON.stringify({
				eventType: 'championship',
				places: [PLACE_ID],
				registrationEnd: new Date(now - 2 * 60 * MINUTE).toISOString(),
				phase: 'running'
			})
		}
	});
	await db.clanChampionshipMatch.create({
		data: {
			eventId: event.id,
			round: 0,
			homeClanId: clanA.id,
			awayClanId: clanB.id,
			homeClanName: clanA.name,
			awayClanName: clanB.name,
			startsAt: new Date(now - 5 * MINUTE),
			endsAt: new Date(now + 2 * DAY),
			placeId: PLACE_ID,
			westClanId: clanA.id,
			obstacles: [],
			status: 'live',
			ticksApplied: 0,
			version: 0
		}
	});

	const mateContext = await browser.newContext();
	try {
		await mateContext.addCookies([
			{ name: `x-drpg-${RELEASE_CHANNEL}-user`, value: mate.id, url: FRONT_URL },
			{ name: `x-drpg-${RELEASE_CHANNEL}-token`, value: mate.token, url: FRONT_URL }
		]);
		const matePage = await mateContext.newPage();
		await Promise.all([
			page.goto(`/clan/${clanA.id}/championship/match`),
			matePage.goto(`/clan/${clanA.id}/championship/match`)
		]);
		await matePage.getByTestId('tab-chat').click();
		const mateEditor = matePage.getByTestId('clan-chat').locator('textarea');
		await expect(mateEditor).toBeEnabled();
		await expect(page.getByTestId('clan-chat').locator('textarea')).toBeEnabled({ timeout: 10_000 });

		// Received while another tab is open: counted on the chat tab
		await mateEditor.fill('On attaque au centre');
		await matePage.getByTestId('chat-send').click();
		await expect(page.getByTestId('chat-unread')).toHaveText('1');

		await page.getByTestId('tab-chat').click();
		await expect(page.getByTestId('chat-unread')).toHaveCount(0);
		await expect(page.getByTestId('chat-message').last()).toContainText('On attaque au centre');

		await page.getByTestId('clan-chat').locator('textarea').fill('Bien reçu');
		await page.getByTestId('chat-send').click();
		await expect(matePage.getByTestId('chat-message').last()).toContainText('Bien reçu');

		// Same messages as the clan forum
		const saved = await db.clanMessage.findMany({ where: { clanId: clanA.id }, orderBy: { id: 'asc' } });
		expect(saved.map(m => m.authorId)).toEqual([mate.id, player.id]);
	} finally {
		await mateContext.close();
		await db.clanEvent.delete({ where: { id: event.id } });
		await db.clanMessage.deleteMany({ where: { clanId: clanA.id } });
		await db.player.updateMany({ where: { id: { in: [player.id, mate.id, rival.id] } }, data: { clanId: null } });
		await db.clanMember.deleteMany({ where: { clanId: { in: [clanA.id, clanB.id] } } });
		await db.clan.deleteMany({ where: { id: { in: [clanA.id, clanB.id] } } });
	}
});

test('a finished match replays every step with the state of both clans, fights included', async ({
	page,
	player,
	createPlayer,
	db
}) => {
	test.setTimeout(90_000);
	const suffix = player.id.slice(0, 8);
	const hadItinerant = (await db.secret.findUnique({ where: { key: 'itinerant' } })) !== null;
	if (!hadItinerant) await db.secret.create({ data: { key: 'itinerant', value: String(PLACE_ID) } });
	const rival = await createPlayer();
	const clanA = await db.clan.create({ data: { name: `e2e-A-${suffix}`, leaderId: player.id } });
	const clanB = await db.clan.create({ data: { name: `e2e-B-${suffix}`, leaderId: rival.id } });
	await db.clanMember.create({ data: { clanId: clanA.id, playerId: player.id, rights: [] } });
	await db.clanMember.create({ data: { clanId: clanB.id, playerId: rival.id, rights: [] } });
	await db.player.update({ where: { id: player.id }, data: { clanId: clanA.id } });
	await db.player.update({ where: { id: rival.id }, data: { clanId: clanB.id } });

	const dinozData = (name: string, playerId: string) => ({
		name,
		raceId: 1,
		level: 1,
		nextUpElementId: 1,
		nextUpAltElementId: 2,
		placeId: PLACE_ID,
		canChangeName: false,
		display: 'A093Rmo7JM3f2000',
		life: 100,
		maxLife: 100,
		experience: 0,
		nbrUpFire: 0,
		nbrUpWood: 0,
		nbrUpWater: 0,
		nbrUpLightning: 0,
		nbrUpAir: 0,
		playerId
	});
	const dinoz = await db.dinoz.create({ data: dinozData(`Mine${suffix}`, player.id) });
	const enemy = await db.dinoz.create({
		data: { ...dinozData(`Foe${suffix}`, rival.id), life: 70, unavailableReason: 'clanChampionship' }
	});

	const now = Date.now();
	const event = await db.clanEvent.create({
		data: {
			eventType: 'championship',
			startDate: new Date(now - DAY),
			endDate: new Date(now + 7 * DAY),
			config: JSON.stringify({
				eventType: 'championship',
				places: [PLACE_ID],
				registrationEnd: new Date(now - 2 * 60 * MINUTE).toISOString(),
				phase: 'running'
			})
		}
	});
	const match = await db.clanChampionshipMatch.create({
		data: {
			eventId: event.id,
			round: 0,
			homeClanId: clanA.id,
			awayClanId: clanB.id,
			homeClanName: clanA.name,
			awayClanName: clanB.name,
			startsAt: new Date(now - 5 * MINUTE),
			endsAt: new Date(now + 2 * DAY),
			placeId: PLACE_ID,
			westClanId: clanA.id,
			obstacles: [],
			status: 'live',
			ticksApplied: 0,
			version: 0
		}
	});

	try {
		// Played for real: entering, moving and attacking each record a replay frame
		await page.goto(`/clan/${clanA.id}/championship/match`);
		await page.getByTestId(`enter-${dinoz.id}`).click();
		await expect(page.getByTestId('board-piece')).toHaveCount(1);
		const piece = await db.clanChampionshipPiece.findFirstOrThrow({ where: { matchId: match.id } });
		const y = piece.y as number;
		await db.clanChampionshipPiece.update({ where: { id: piece.id }, data: { actionPoints: 3 } });
		await db.clanChampionshipPiece.create({
			data: { matchId: match.id, dinozId: enemy.id, playerId: rival.id, clanId: clanB.id, x: 2, y, actionPoints: 4 }
		});
		await page.reload();
		await page.getByTestId(`board-cell-0-${y}`).click();
		await page.getByTestId(`board-cell-1-${y}`).click();
		await expect(page.getByTestId(`board-cell-1-${y}`).getByTestId('board-piece')).toBeVisible();
		await page.getByTestId(`board-cell-1-${y}`).click();
		await page.getByTestId(`board-cell-2-${y}`).click();
		await page.waitForURL(/\/replay\//);

		// The match is over: the replay opens to both clans
		await db.clanChampionshipMatch.update({ where: { id: match.id }, data: { status: 'finished' } });
		const frames = await db.clanChampionshipFrame.findMany({
			where: { matchId: match.id },
			orderBy: { version: 'asc' }
		});
		expect(frames.map(f => (f.events as { type: string }[])[0].type)).toEqual(['enter', 'move', 'attack']);

		await page.goto(`/clan/${clanA.id}/championship`);
		await page.getByTestId('match-replay-link').click();
		await page.waitForURL(`**/championship/replay/${match.id}`);

		const step = page.getByTestId('replay-step');
		await expect(step).toContainText('Étape 1 / 3');
		await expect(step).toContainText(`Mine${suffix} entre sur le damier`);

		await page.getByTestId('replay-next').click();
		await expect(step).toContainText(`Mine${suffix} se déplace en (1, ${y})`);
		// Omniscient: the enemy piece, inserted without a frame of its own, shows up with its life and action points
		const rows = page.getByTestId('replay-roster-row');
		await expect(rows.filter({ hasText: `Foe${suffix}` })).toContainText('70 / 100');
		await expect(page.getByTestId(`board-cell-2-${y}`).getByTestId('board-piece-ap')).toHaveText('4');

		await page.getByTestId('replay-next').click();
		await expect(step).toContainText(`Mine${suffix} attaque Foe${suffix}`);
		await page.getByTestId('replay-show-fight').click();
		await expect(page.getByTestId('replay-fight').locator('canvas')).toBeVisible({ timeout: 20_000 });
	} finally {
		if (!hadItinerant) await db.secret.deleteMany({ where: { key: 'itinerant' } });
		await db.clanEvent.delete({ where: { id: event.id } });
		await db.dinoz.deleteMany({ where: { playerId: { in: [player.id, rival.id] } } });
		await db.player.updateMany({ where: { id: { in: [player.id, rival.id] } }, data: { clanId: null } });
		await db.clanMember.deleteMany({ where: { clanId: { in: [clanA.id, clanB.id] } } });
		await db.clan.deleteMany({ where: { id: { in: [clanA.id, clanB.id] } } });
	}
});
