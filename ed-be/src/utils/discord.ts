import { WebhookClient } from 'discord.js';
import { getAllSecretsRequest } from '../dao/secretDao.js';
import fs from 'fs';

export async function sendJSONToDiscord(description: string, json: object) {
	const secrets = await getAllSecretsRequest();
	const discordToken = secrets.find(s => s.key === 'token');
	const discordChannel = secrets.find(s => s.key === 'channel');
	try {
		if (!(discordToken && discordChannel)) return;
		const webhookClient = new WebhookClient({
			id: discordChannel.value,
			token: discordToken.value
		});

		const _msgs = JSON.stringify(json, null, 2);
		fs.writeFileSync('./error.json', _msgs);
		await webhookClient.send({ content: description, files: ['./error.json'] });
		fs.unlinkSync('./error.json');
	} catch (error) {
		console.error('Error trying to send a message: ', error);
	}
}
