import { expect, test } from '../support/fixtures.js';

test('an anonymous visitor is sent to the Eternaltwin login page', async ({ page }) => {
	await page.goto('/ranking/player?page=1');

	await expect(page).toHaveURL(/\/authentication$/);
	await expect(page.getByText('Connexion à Eternaltwin')).toBeVisible();
});

test('a logged-in player lands on the news with their gold', async ({ page, player }) => {
	await page.goto('/');

	await expect(page).toHaveURL(/\/$/);
	await expect(page.locator('#accountList .money')).toHaveText(/1\s000\s000/);
	// The account link lives in the right-hand menu, closed by default.
	await expect(page.locator(`a[href="/player/${player.id}"]`).first()).toBeAttached();
});

test('a player who has not accepted the terms must accept them first', async ({ page, createPlayer, login, db }) => {
	const player = await createPlayer({ tosAccepted: false });
	await login(player);

	await page.goto('/ranking/player?page=1');
	await expect(page).toHaveURL(/\/terms$/);

	await page.getByText("J'accepte").click();

	await expect(page).toHaveURL(/\/$/);
	const saved = await db.player.findUniqueOrThrow({ where: { id: player.id } });
	expect(saved.tosAccepted).toBe(true);
});

test('logging in opens a single notification stream', async ({ page, player }) => {
	const sseAuthentications: string[] = [];
	page.on('request', request => {
		if (request.method() === 'POST' && request.url().endsWith('/server-events/sse/authenticate')) {
			sseAuthentications.push(request.url());
		}
	});

	await page.goto('/');
	await expect(page.locator('#accountList .money')).toBeVisible();
	await page.waitForLoadState('networkidle');

	expect(sseAuthentications).toHaveLength(1);
	await expect(page.getByText('Too many requests')).toHaveCount(0);
});
