import { ErrorFormator } from './errorFormator.js';
import { Config } from '../models/index.js';
import { getConfig } from './context.js';
import { Response } from 'express';
import { EmbedBuilder, WebhookClient } from 'discord.js';

export async function postError(e: ErrorFormator, res: Response) {
	try {
		const config = getConfig() as Config;

		const webhookClient = new WebhookClient({
			id: config.discord.channel,
			token: config.discord.token
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
				embed.addFields({
					name: 'Body',
					value: `\`\`\`json
  ${JSON.stringify(res.req.body)}
  \`\`\``
				});
			}
		}
		await webhookClient.send({ embeds: [embed] });
	} catch (err) {
		console.error('Error trying to send a message: ', err);
	}
}
