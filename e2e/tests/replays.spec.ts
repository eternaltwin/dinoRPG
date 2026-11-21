import { expect, test } from '../support/fixtures.js';

test('a fight from my replays can be kept as a favorite', async ({ page, player, createPlayer, db }) => {
	const opponent = await createPlayer();
	const fighters = (left: string, right: string) =>
		JSON.stringify([
			{ id: 1, type: 'dinoz', name: left, attacker: true },
			{ id: 2, type: 'dinoz', name: right, attacker: false }
		]);
	const archive = await db.fightArchive.create({
		data: {
			fighters: fighters('Moustache', 'Brindille'),
			steps: '[]',
			seed: 'e2e',
			result: true,
			playerId: player.id,
			leftPlayerId: player.id,
			rightPlayerId: opponent.id
		}
	});

	// The page opens on my fights
	await page.goto('/replays');
	const row = page.getByTestId(`replay-${archive.id}`);
	await expect(row).toContainText('Moustache');
	await expect(row).toContainText('Brindille');
	await expect(row).toContainText(opponent.name);
	await expect(row).toContainText('Victoire');

	await page.getByTestId(`favorite-${archive.id}`).click();
	await expect(row).toContainText('Conservé');
	await expect
		.poll(async () => (await db.fightWatched.findFirst({ where: { playerId: player.id } }))?.favorite)
		.toBe(true);

	await page.getByTestId('tab-favorites').click();
	await expect(page.getByTestId(`replay-${archive.id}`)).toBeVisible();
	await expect(page.getByTestId('tab-favorites')).toContainText('1/25');
});

test('a PvP fight can be kept as a favorite from its replay, the old share link included', async ({
	page,
	player,
	createPlayer,
	db
}) => {
	const opponent = await createPlayer();
	const archive = await db.fightArchive.create({
		data: {
			fighters: JSON.stringify([
				{ id: 1, type: 'dinoz', name: 'Moustache', attacker: true },
				{ id: 2, type: 'dinoz', name: 'Brindille', attacker: false }
			]),
			steps: '[]',
			seed: 'e2e',
			result: true,
			playerId: player.id,
			leftPlayerId: player.id,
			rightPlayerId: opponent.id
		}
	});

	await page.goto(`/dojo/share/${archive.id}`);
	await expect(page).toHaveURL(new RegExp(`/replay/${archive.id}$`));
	await page.getByTestId('fight-favorite').click();
	await expect(page.getByTestId('fight-favorite')).toContainText('Retirer des favoris');
	await expect
		.poll(async () => (await db.fightWatched.findFirst({ where: { playerId: player.id } }))?.favorite)
		.toBe(true);
});

test('a fight that is not PvP cannot be kept as a favorite', async ({ page, player, db }) => {
	const archive = await db.fightArchive.create({
		data: {
			fighters: JSON.stringify([
				{ id: 1, type: 'dinoz', name: 'Moustache', attacker: true },
				{ id: 2, type: 'monster', name: 'Goupignon', attacker: false }
			]),
			steps: '[]',
			seed: 'e2e',
			result: true,
			playerId: player.id,
			leftPlayerId: player.id
		}
	});

	await page.goto('/replays');
	await expect(page.getByTestId(`replay-${archive.id}`)).toBeVisible();
	await expect(page.getByTestId(`favorite-${archive.id}`)).toHaveCount(0);
});
