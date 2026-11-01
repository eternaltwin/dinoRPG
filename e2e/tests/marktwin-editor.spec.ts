import { expect, test } from '../support/fixtures.js';

test('a clan message is written in Marktwin, previewed and stored as escaped HTML', async ({ page, player, db }) => {
	const clan = await db.clan.create({
		data: {
			name: `e2e-clan-${player.id.slice(0, 8)}`,
			leader: { connect: { id: player.id } },
			members: { create: { playerId: player.id } }
		}
	});

	await page.goto(`/clan/${clan.id}/discussion`);

	const editor = page.locator('.mkt-editor');
	const field = editor.locator('textarea');
	await expect(field).toBeVisible();

	// Accents in the middle of the text: marktwin 0.6.0 as published panics on them.
	await field.fill('Salut à tous, ça roule ? <b>pas du html</b>');
	await field.selectText();
	await editor.getByRole('button', { name: /^Gras/ }).click();
	await expect(field).toHaveValue('**Salut à tous, ça roule ? <b>pas du html</b>**');

	await editor.getByRole('tab', { name: 'Aperçu' }).click();
	const preview = editor.locator('.preview .mkt-content');
	await expect(preview.locator('strong')).toHaveText('Salut à tous, ça roule ? <b>pas du html</b>');
	await expect(preview.locator('b')).toHaveCount(0);

	await editor.getByRole('tab', { name: 'Écrire' }).click();
	await field.press('Control+Enter');

	const posted = page.locator('.msg-card .mkt-content').first();
	await expect(posted.locator('strong')).toHaveText('Salut à tous, ça roule ? <b>pas du html</b>');
	await expect(field).toHaveValue('');

	const saved = await db.clanMessage.findFirstOrThrow({ where: { clanId: clan.id } });
	expect(saved.content).toBe('<strong>Salut à tous, ça roule ? &lt;b&gt;pas du html&lt;/b&gt;</strong>');
});
