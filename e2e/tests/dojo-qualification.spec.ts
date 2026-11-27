import { expect, test } from '../support/fixtures.js';

const PLACE_ID = 5; // PlaceEnum.DINOVILLE

// Race id and swf letter (first character of the display) of 5 different races
const RACES = [
	{ raceId: 1, letter: '0' }, // moueffe
	{ raceId: 3, letter: '1' }, // pigmou
	{ raceId: 5, letter: '2' }, // winks
	{ raceId: 7, letter: '3' }, // planaille
	{ raceId: 9, letter: '4' } // castivore
];

test('the qualification team needs 5 different races before it can be validated', async ({ page, player, db }) => {
	test.setTimeout(60_000);
	// Dinoz sheets need the weekly itinerant merchant place, normally set by a cron job.
	// Kept afterwards: specs run in parallel and share it
	await db.secret.upsert({
		where: { key: 'itinerant' },
		create: { key: 'itinerant', value: String(PLACE_ID) },
		update: {}
	});

	const dinozData = (name: string, race: (typeof RACES)[number]) => ({
		name,
		raceId: race.raceId,
		level: 10,
		nextUpElementId: 1,
		nextUpAltElementId: 2,
		placeId: PLACE_ID,
		canChangeName: false,
		display: `${race.letter}0${'a'.repeat(11)}000`,
		life: 100,
		maxLife: 100,
		experience: 0,
		nbrUpFire: 0,
		nbrUpWood: 0,
		nbrUpWater: 0,
		nbrUpLightning: 0,
		nbrUpAir: 0,
		playerId: player.id
	});
	// Two dinoz of the first race: they count as a single race
	const twin = await db.dinoz.create({ data: dinozData('Twin', RACES[0]) });
	const dinoz = [];
	for (const [index, race] of RACES.entries()) {
		dinoz.push(await db.dinoz.create({ data: dinozData(`Race${index}`, race) }));
	}

	// The dojo is created on the first visit of its home page
	await page.goto('/dojo');
	await page.waitForLoadState('networkidle');
	await page.goto('/dojo/challenge');

	const counter = page.getByTestId('race-counter');
	await expect(counter).toContainText('0/5');

	// 5 dinoz but only 4 races: the validation is blocked with an explanation
	for (const d of [twin, ...dinoz.slice(0, 4)]) {
		await page.getByTestId(`select-dinoz-${d.id}`).click();
	}
	await expect(counter).toContainText('4/5');
	await expect(page.getByTestId('selection-blocked')).toBeVisible();
	await expect(page.getByTestId('select-dinoz-validate')).toHaveClass(/\boff\b/);

	// A 5th race unlocks it
	await page.getByTestId(`select-dinoz-${dinoz[4].id}`).click();
	await expect(counter).toContainText('5/5');
	await expect(page.getByTestId('selection-blocked')).toBeHidden();
	await expect(page.getByTestId('select-dinoz-validate')).not.toHaveClass(/\boff\b/);
});
