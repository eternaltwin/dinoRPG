import { expect, test } from '../support/fixtures.js';

test('a clan name with markup is shown without running it', async ({ page, player, db }) => {
	// Created in database: the API now refuses this name, older clans may still carry one
	const clan = await db.clan.create({
		data: {
			name: `e2e-xss-${player.id.slice(0, 8)}<img src="x" onerror="window.__xss = true">`,
			leader: { connect: { id: player.id } },
			members: { create: { playerId: player.id } }
		}
	});

	await page.goto(`/clan/${clan.id}`);

	const header = page.locator('.titlePage');
	await expect(header).toContainText(`e2e-xss-${player.id.slice(0, 8)}`);
	// DOMPurify keeps the image but drops its handler
	await expect(header.locator('img[onerror]')).toHaveCount(0);
	await page.waitForLoadState('networkidle');
	expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
});
