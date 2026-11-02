import { expect, test } from '../support/fixtures.js';

const PLACE_ID = 5; // PlaceEnum.DINOVILLE
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

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
