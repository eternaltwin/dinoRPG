import { expect, test } from '../support/fixtures.js';

const PAGES = [
	'/',
	'/shop/dinoz',
	'/shop/flying',
	'/ranking/player?page=1',
	'/ingredients',
	'/clans',
	'/dojo',
	'/help',
	'/faq'
];

// Only uncaught script errors fail these: ed-be answers 500 to expected domain errors too (sendErrors.ts),
// so a 5xx is not a reliable signal on its own.
for (const path of PAGES) {
	test(`${path} renders without script errors`, async ({ page, player }) => {
		const errors: string[] = [];
		page.on('pageerror', error => errors.push(error.message));

		await page.goto(path);
		await page.waitForLoadState('networkidle');

		await expect(page.locator('#accountList .money')).toBeVisible();
		expect(errors).toEqual([]);
	});
}
