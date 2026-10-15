import { expect, test } from '../support/fixtures.js';

const digits = (text: string | null) => Number((text ?? '').replace(/\D/g, ''));

test('buying a dinoz from the enclosure opens its page and charges its price', async ({ page, player, db }) => {
	await page.goto('/shop/dinoz');

	const firstOffer = page.locator('.dinoz_card').first();
	await expect(firstOffer).toBeVisible();
	const price = digits(await firstOffer.locator('.price .money').textContent());
	expect(price).toBeGreaterThan(0);

	await firstOffer.getByText('Choisir').click();
	await page.getByTestId('confirm-accept').click();

	await expect(page).toHaveURL(/\/dino\/\d+$/);
	const dinozId = Number(page.url().split('/').pop());
	const gold = page.locator('#accountList .money');
	await expect.poll(async () => digits(await gold.textContent())).toBe(1_000_000 - price);

	const saved = await db.player.findUniqueOrThrow({ where: { id: player.id }, include: { dinoz: true } });
	expect(saved.money).toBe(1_000_000 - price);
	expect(saved.dinoz.map(d => d.id)).toEqual([dinozId]);
});
