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

function countSse(page: import('@playwright/test').Page) {
	const counts = { authentications: 0, streams: 0 };
	page.on('request', request => {
		const url = request.url();
		if (request.method() === 'POST' && url.endsWith('/server-events/sse/authenticate')) counts.authentications++;
		if (request.method() === 'GET' && url.includes('/server-events/events?ticket=')) counts.streams++;
	});
	return counts;
}

test('reloading the page opens the notification stream again', async ({ page, player }) => {
	await page.goto('/');
	await expect(page.locator('#accountList .money')).toBeVisible();

	// The player store survives the reload, so nothing changes in it: the stream must open anyway.
	const counts = countSse(page);
	await page.reload();
	await expect(page.locator('#accountList .money')).toBeVisible();

	await expect.poll(() => counts.streams).toBe(1);
	expect(counts.authentications).toBe(1);
});

test('the notification stream comes back after it drops', async ({ page, player }) => {
	let dropped = 0;
	await page.route('**/server-events/events?ticket=*', async route => {
		if (dropped < 2) {
			dropped++;
			return route.abort();
		}
		return route.continue();
	});
	const counts = countSse(page);

	await page.goto('/');
	await expect(page.locator('#accountList .money')).toBeVisible();

	// Each drop asks for a fresh ticket: the one in the URL of the dropped stream was consumed.
	await expect.poll(() => counts.authentications, { timeout: 15_000 }).toBe(3);
	await expect.poll(() => counts.streams).toBe(3);
});
