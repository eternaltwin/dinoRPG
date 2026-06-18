/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { AttachmentBuilder, EmbedBuilder, WebhookClient } from 'discord.js';
import type { Response } from 'express';
import { Logger } from '../../logger/index.js';
import fs from 'fs';
import { GLOBAL } from '../../context.js';
import { Player } from '@drpg/prisma';

const DEFAULT_TIMEOUT = 5000;
// Maximum accepted length for the embed title
const MAX_EMBED_TITLE_LENGTH = 256;
// Maximum description length for embed
const MAX_EMBED_DESCRIPTION = 4096;
// Maximum accepted length for the main message content
export const MAX_CONTENT_LENGTH = 2000;
// Ellipsis character, used to indicate truncated content
const ELLIPSIS = '…';
const SEND_MESSAGE_PREFIX = '```\n';
const SEND_MESSAGE_SUFFIX = '\n```';
const SEND_MESSAGE_SUFFIX_TRUNCATED = `\n${ELLIPSIS}\n\`\`\``;
// Maximum length of a `sendMessage` input to avoid truncation
export const SEND_MESSAGE_SAFE_LENGTH = MAX_CONTENT_LENGTH - SEND_MESSAGE_PREFIX.length - SEND_MESSAGE_SUFFIX.length;

/**
 * Format the provided string as an embed title.
 *
 * If the string is too long, it will be truncated to fit.
 */
function formatEmbedTitle(title: string) {
	if (title.length <= MAX_EMBED_TITLE_LENGTH) {
		return title;
	}
	const shortTitle = title.substring(0, MAX_EMBED_TITLE_LENGTH - ELLIPSIS.length);
	return shortTitle + ELLIPSIS;
}

/**
 * Format the provided string as an embed description.
 *
 * If the string is too long, it will be truncated to fit.
 */
function formatMarkdownForEmbed(text: string): string {
	const convertedText = text
		// Convert # headers to **bold**
		.replace(/^# (.+)$/gm, '**$1**')
		// Convert ## headers to **bold**
		.replace(/^## (.+)$/gm, '**$1**')
		// Convert ### headers to **bold**
		.replace(/^### (.+)$/gm, '**$1**')
		// Convert #### headers to *italic*
		.replace(/^#### (.+)$/gm, '*$1*')
		// Convert ##### headers to *italic*
		.replace(/^##### (.+)$/gm, '*$1*')
		// Clean up multiple consecutive newlines
		.replace(/\n{3,}/g, '\n\n');

	if (convertedText.length <= MAX_EMBED_DESCRIPTION) {
		return convertedText;
	}
	const shortText = convertedText.substring(0, MAX_EMBED_DESCRIPTION - ELLIPSIS.length);
	return shortText + ELLIPSIS;
}

export interface DiscordClient {
	sendError(error: Error, res?: Response): void;
	sendMessage(message: string, data: object[]): Promise<void>;
	sendPantheonNotification(
		message: string,
		player: Pick<Player, 'name' | 'id'>,
		image?: Uint8Array | undefined
	): Promise<void>;
	sendNewsNotification(title: string, test: string, image: Uint8Array | undefined): Promise<void>;
}

export const NOOP_DISCORD_CLIENT: DiscordClient = {
	sendError() {},
	sendMessage() {
		return Promise.resolve();
	},
	sendPantheonNotification() {
		return Promise.resolve();
	},
	sendNewsNotification() {
		return Promise.resolve();
	}
};

export interface NetworkDiscordClientOptions {
	pantheonWebhookId: string;
	pantheonWebhookToken: string;
	newsWebhookId: string;
	newsWebhookToken: string;
	logWebhookId: string;
	logWebhookToken: string;
	timeout?: number;
	logger: Logger;
	server: URL;
}

export class NetworkDiscordClient implements DiscordClient {
	readonly #logger: Logger;

	readonly #server: URL;

	/**
	 * Client used to send pantheon notifications
	 */
	readonly #pantheonClient: WebhookClient;

	/**
	 * Client used to send news notifications
	 */
	readonly #newsClient: WebhookClient;

	/**
	 * Client used to send logs
	 */
	readonly #logClient: WebhookClient;

	/**
	 * Create a new Discord client
	 *
	 * If the config is `null`, methods will be no-ops.
	 */
	public constructor(options: NetworkDiscordClientOptions) {
		const clientOptions = {
			rest: {
				timeout: options.timeout ?? DEFAULT_TIMEOUT
			}
		};
		this.#pantheonClient = new WebhookClient(
			{
				id: options.pantheonWebhookId,
				token: options.pantheonWebhookToken
			},
			clientOptions
		);
		this.#newsClient = new WebhookClient(
			{
				id: options.newsWebhookId,
				token: options.newsWebhookToken
			},
			clientOptions
		);
		this.#logClient = new WebhookClient(
			{
				id: options.logWebhookId,
				token: options.logWebhookToken
			},
			clientOptions
		);
		this.#logger = options.logger;
		this.#server = options.server;
	}

	public sendError(error: Error, res?: Response) {
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(formatEmbedTitle(res ? res.req.url : error.message))
			.setAuthor({
				name: 'DinoRPG',
				iconURL: `${this.#server}favicon.png`
			})
			.setDescription(
				`\`\`\`
${error.stack}
\`\`\``
			)
			.setTimestamp();

		if (res) {
			embed.addFields(
				// Request method
				{ name: 'Method', value: res.req.method, inline: true },
				// Response status code
				{ name: 'Status code', value: (res.statusCode || 0).toString(), inline: true },
				// Response status message
				{ name: 'Status', value: res.statusMessage || '', inline: true }
			);

			if (res.req.headers.authorization) {
				const [playerId] = Buffer.from(res.req.headers.authorization.split(' ')[1] || '', 'base64')
					.toString()
					.split(':');
				// Request auth
				if (playerId) {
					embed.addFields({
						name: 'PlayerId',
						value: playerId,
						inline: true
					});
				}
			}

			// Request params
			if (Object.keys(res.req.params as object).length) {
				embed.addFields({
					name: 'Params',
					value: `\`\`\`json
  ${JSON.stringify(res.req.params)}
  \`\`\``.substring(0, 1024)
				});
			}

			// Request body
			if (Object.keys(res.req.body as object).length) {
				embed.addFields({
					name: 'Body',
					value: `\`\`\`json
  ${JSON.stringify(res.req.body)}
  \`\`\``.substring(0, 1024)
				});
			}
		}

		this.#logClient.send({ embeds: [embed] }).catch(err => {
			this.#logger.error(`Error trying to send a message: ${err}`);
		});
	}

	public async sendMessage(message: string, data: object[]) {
		let content = SEND_MESSAGE_PREFIX + message + SEND_MESSAGE_SUFFIX;
		if (content.length > MAX_CONTENT_LENGTH) {
			const shortLen = MAX_CONTENT_LENGTH - SEND_MESSAGE_PREFIX.length - SEND_MESSAGE_SUFFIX_TRUNCATED.length;
			const short = message.substring(0, shortLen);
			content = SEND_MESSAGE_PREFIX + short + SEND_MESSAGE_SUFFIX_TRUNCATED;
		}

		const files: string[] = [];
		data.forEach((item, index) => {
			const fileName = `./error-${index}.json`;
			fs.writeFileSync(fileName, JSON.stringify(item, null, 2));
			files.push(fileName);
		});
		this.#logClient
			.send({ content, files })
			.catch(err => {
				this.#logger.error(`Error trying to send a message: ${err}`);
			})
			.finally(() => {
				files.forEach(file => {
					fs.unlinkSync(file);
				});
			});
	}

	public async sendPantheonNotification(
		message: string,
		player: Pick<Player, 'name' | 'id'>,
		image?: Uint8Array | undefined
	) {
		if (image) {
			const attachment = new AttachmentBuilder(Buffer.from(image), { name: 'dino.png' });

			const embed = new EmbedBuilder()
				.setTitle(player.name)
				.setURL(`${GLOBAL.config.selfUrl}/player/${player.id}`)
				.setDescription(message)
				.setColor(10829079)
				.setAuthor({
					name: 'DinoRPG',
					iconURL: `https://dinorpg.eternaltwin.org/favicon.ico` // Does not work, need a permalink to add the favicon
				})
				.setThumbnail('attachment://dino.png')
				.setImage('attachment://dino.png')
				.setTimestamp();

			await this.#pantheonClient.send({ embeds: [embed], files: [attachment] });
		} else {
			let content = SEND_MESSAGE_PREFIX + message + SEND_MESSAGE_SUFFIX;
			if (content.length > MAX_CONTENT_LENGTH) {
				const shortLen = MAX_CONTENT_LENGTH - SEND_MESSAGE_PREFIX.length - SEND_MESSAGE_SUFFIX_TRUNCATED.length;
				const short = message.substring(0, shortLen);
				content = SEND_MESSAGE_PREFIX + short + SEND_MESSAGE_SUFFIX_TRUNCATED;
				await this.#pantheonClient.send({ content });
			}
		}
	}

	public async sendNewsNotification(title: string, text: string, image: Uint8Array | undefined) {
		const embed = new EmbedBuilder()
			.setColor(0x8b4513)
			.setTitle(formatEmbedTitle(title))
			.setAuthor({
				name: 'DinoRPG',
				iconURL: `https://dinorpg.eternaltwin.org/favicon.ico` // Does not work, need a permalink to add the favicon
			})
			.setDescription(formatMarkdownForEmbed(text))
			.setTimestamp();

		const files: AttachmentBuilder[] = [];
		if (image) {
			const image_builder = new AttachmentBuilder(Buffer.from(image));
			files.push(image_builder);
		}

		embed.addFields({
			name: 'Consult the news in all languages ingame!',
			value: '[DinoRPG](https://dinorpg.eternaltwin.org/)'
		});

		await this.#newsClient.send({ embeds: [embed], files: files });

		// Example code to post the news as plain markdown
		// let content = `**${title}**\n\n${text}`;
		// if (content.length > MAX_CONTENT_LENGTH) {
		// 	const short = content.substring(0, MAX_CONTENT_LENGTH);
		// 	content = short;
		// }
		// await this.#newsClient.send({ content });
	}
}
