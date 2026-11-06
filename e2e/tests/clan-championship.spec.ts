import { expect, test } from '../support/fixtures.js';

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

		await page.getByTestId(`board-cell-0-${y}`).click();
		await page.getByTestId(`board-cell-1-${y}`).click();

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

test('the championship page shows the standings and the next match', async ({ page, player, createPlayer, db }) => {
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

		const standings = page.getByTestId('standings');
		await expect(standings.getByRole('row').filter({ hasText: clanA.name }).getByRole('cell').last()).toHaveText('3');
		await expect(standings.getByRole('row').filter({ hasText: clanB.name }).getByRole('cell').last()).toHaveText('0');

		const next = page.getByTestId('next-match');
		await expect(next).toContainText(clanB.name);
		await expect(next).toContainText('Lieu du match : Dinoville');

		await expect(page.getByText('Terminé', { exact: true })).toBeVisible();
		await expect(page.getByText('12 – 3')).toBeVisible();
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
