import { EmbedBuilder, WebhookClient } from 'discord.js';
import { Response } from 'express';
import { getAllSecretsRequest } from '../dao/secretDao.js';
import { ErrorFormator } from './errorFormator.js';
import fs from 'fs';

export async function postError(e: ErrorFormator, res: Response) {
	const secrets = await getAllSecretsRequest();
	const discordToken = secrets.find(s => s.key === 'token');
	const discordChannel = secrets.find(s => s.key === 'channel');
	//Do no send Discord notification if error is to display toast
	if (e.errorCode === 400) return;
	try {
		if (!(discordToken && discordChannel)) {
			console.error(e);
			return;
		}
		const webhookClient = new WebhookClient({
			id: discordChannel.value,
			token: discordToken.value
		});

		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(res ? res.req.url : '')
			.setAuthor({
				name: 'Mandragore'
			})
			.setDescription(
				`\`\`\`
${e}
\`\`\``
			)
			.setTimestamp();
		if (res) {
			embed.addFields(
				// Request method
				{ name: 'Method', value: res.req.method, inline: true },
				// Response status code
				{ name: 'Status code', value: res.statusCode.toString(), inline: true },
				// Response status message
				{ name: 'Status', value: e.message, inline: true }
			);

			// Request params
			if (Object.keys(res.req.params as object).length) {
				embed.addFields({
					name: 'Params',
					value: `\`\`\`json
  ${JSON.stringify(res.req.params)}
  \`\`\``
				});
			}

			// Request body
			if (Object.keys(res.req.body as object).length) {
				if (res.req.body.password) res.req.body.password = '*******';
				embed.addFields({
					name: 'Body',
					value: `\`\`\`json
  ${JSON.stringify(res.req.body)}
  \`\`\``
				});
			}

			// Request body
			if (Object.keys(res.req.auth as object).length) {
				embed.addFields({
					name: 'User',
					value: `\`\`\`json
  ${JSON.stringify(res.req.auth)}
  \`\`\``
				});
			}
		}
		await webhookClient.send({ embeds: [embed] });
	} catch (err) {
		console.error('Error trying to send a message: ', err);
	}
}

export async function sendDiscord(props: string) {
	const secrets = await getAllSecretsRequest();
	const discordToken = secrets.find(s => s.key === 'token');
	const discordChannel = secrets.find(s => s.key === 'channel');
	try {
		if (!(discordToken && discordChannel)) {
			console.log(props);
			return;
		}
		const webhookClient = new WebhookClient({
			id: discordChannel.value,
			token: discordToken.value
		});

		await webhookClient.send(props);
	} catch (error) {
		console.error('Error trying to send a message: ', error);
	}
}

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
