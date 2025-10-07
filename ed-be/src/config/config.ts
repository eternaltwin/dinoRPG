import * as dotenv from 'dotenv';

/**
 * Configuration for the Eternaltwin client.
 *
 * The Eternaltwin client is used for authentication and logs.
 */
export interface EternaltwinConfig {
	/**
	 * Absolute URL to the Eternaltwin root.
	 */
	readonly url: string;

	/**
	 * OAuth client reference (uuid or key).
	 *
	 * This should match the app as register on Eternaltwin server.
	 * For apps registered through the Eternaltwin config `seed.app.<key>`,
	 * the value should be `<key>@clients`.
	 */
	readonly clientRef: string;

	/**
	 * Secret shared with the Eternalfest server.
	 *
	 * For apps registered through the Eternaltwin config, it corresponds
	 * to `seed.app.<key>.secret`.
	 */
	readonly secret: string;

	/**
	 * Name of the app as registered with Eternaltwin.
	 *
	 * (First part of the client key).
	 */
	readonly app: string;

	/**
	 * Name of the channel as register with Eternaltwin.
	 *
	 * (Second part of the client key).
	 */
	readonly channel: string;

	/**
	 * Id of the DinoRPG section's forum
	 *
	 *
	 */
	readonly section: string;
}

/**
 * Configuration for the Discord client.
 *
 * The discord client is used for logs and notifcations.
 */
export interface DiscordConfig {
	/**
	 * Discord webhook id
	 */
	readonly webhookId: string;

	/**
	 * Discord webhook token (secret)
	 */
	readonly webhookToken: string;
}

/**
 * Server configuration
 */
export interface Config {
	/**
	 * Boolean indicating if the server should run in production mode.
	 */
	readonly isProduction: boolean;

	/**
	 * Port used to bind the HTTP server.
	 */
	readonly port: number;

	/**
	 * Port used to communicate with WebSocket.
	 */
	readonly wssPort: number;

	/**
	 * Absolute URL to website root, as visible externally.
	 */
	readonly selfUrl: URL;

	/**
	 * Configuration for the Eternaltwin client.
	 */
	readonly eternaltwin: EternaltwinConfig;

	/**
	 * Application administrator.
	 */
	readonly administrator: string;

	/**
	 * Configuration for the Discord client used for pantheon notifications (optional).
	 */
	readonly discordPantheonNotifications: DiscordConfig | null;

	/**
	 * Configuration for the Discord client used for news notifications (optional).
	 */
	readonly discordNewsNotifications: DiscordConfig | null;

	/**
	 * Configuration for the Discord client used for logs (optional).
	 */
	readonly discordLogs: DiscordConfig | null;

	/**
	 * Salt for secret seed
	 */
	readonly salt: string;
}

/**
 * Read the port value based on the provided env value.
 *
 * Returns a default port if the value is missing or invalid.
 *
 * @param envPort Value of the `PORT` environment variable.
 */
export function readPort(envPort: string | undefined): number {
	if (typeof envPort === 'string') {
		const numPort = parseInt(envPort, 10);
		if (!Number.isNaN(numPort)) {
			return numPort;
		}
	}
	return 8081;
}

/**
 * Read the self-URL value based on the provided env value.
 *
 * Returns a default port if the value is missing or invalid.
 *
 * @param envSelfUrl Value of the `SELF_URL` environment variable.
 */
export function readSelfUrl(envSelfUrl: string | undefined): URL {
	if (typeof envSelfUrl === 'string') {
		try {
			const selfUrl = new URL(envSelfUrl);
			if (selfUrl.protocol === 'http:' || selfUrl.protocol === 'https:') {
				return selfUrl;
			}
		} catch {
			// fall through and return default
		}
	}
	return new URL('http://localhost:8080/');
}

/**
 * Read the expiration value based on the provided env value.
 *
 * Returns a default port if the value is missing or invalid.
 *
 * @param expiration Value of the `EXPIRATION` environment variable.
 */
export function readExpiration(expiration: string | undefined): number {
	if (typeof expiration === 'string') {
		const numExpiration = parseInt(expiration, 10);
		if (!Number.isNaN(numExpiration)) {
			return numExpiration;
		}
	}
	return 2592000;
}

export function readBoolean(envVariable: string | undefined): boolean {
	if (typeof envVariable === 'string') {
		return JSON.parse(envVariable);
	}
	return false;
}

/**
 * Read the provided environment recorded and build a config object.
 */
export function config(env: Record<string, string | undefined>): Config {
	dotenv.config();

	const isProduction: boolean = env.NODE_ENV === 'production';
	const port = readPort(env.PORT);
	const wssPort = readPort(env.WSS_PORT);
	const selfUrl = readSelfUrl(env.SELF_URL);

	const eternaltwinUrl: string = env.ETERNALTWIN_URL ?? env.ETWIN_URL ?? 'http://localhost:50320/';
	const eternaltwinClientRef: string = env.ETERNALTWIN_CLIENT_REF ?? env.ETWIN_CLIENT_ID ?? 'dinorpg@clients';
	const eternaltwinSecret: string = env.ETERNALTWIN_SECRET ?? env.ETWIN_CLIENT_SECRET ?? 'dev_secret';
	const eternaltwinApp: string = env.ETERNALTWIN_APP ?? 'dinorpg';
	const eternaltwinChannel: string = env.ETERNALTWIN_CHANNEL ?? 'dev';
	const eternaltwinSection: string = env.ETERNALTWIN_SECTION ?? 'e99e23b8-3b70-4238-9846-aab8b0c49e4c';

	const eternaltwin: EternaltwinConfig = {
		url: eternaltwinUrl,
		clientRef: eternaltwinClientRef,
		secret: eternaltwinSecret,
		app: eternaltwinApp,
		channel: eternaltwinChannel,
		section: eternaltwinSection
	};

	const rawDiscordPantheonNotifId = env.DISCORD_PANTHEON_WEBHOOK_ID;
	const rawDiscordPantheonNotifToken = env.DISCORD_PANTHEON_WEBHOOK_TOKEN;
	let discordPantheonNotifications: DiscordConfig | null = null;
	if (typeof rawDiscordPantheonNotifId === 'string' && typeof rawDiscordPantheonNotifToken === 'string') {
		discordPantheonNotifications = {
			webhookId: rawDiscordPantheonNotifId,
			webhookToken: rawDiscordPantheonNotifToken
		};
	}

	const rawDiscordNewsNotifId = env.DISCORD_NEWS_WEBHOOK_ID;
	const rawDiscordNewsNotifToken = env.DISCORD_NEWS_WEBHOOK_TOKEN;
	let discordNewsNotifications: DiscordConfig | null = null;
	if (typeof rawDiscordNewsNotifId === 'string' && typeof rawDiscordNewsNotifToken === 'string') {
		discordNewsNotifications = {
			webhookId: rawDiscordNewsNotifId,
			webhookToken: rawDiscordNewsNotifToken
		};
	}

	const rawDiscordLogId = env.DISCORD_LOGS_WEBHOOK_ID;
	const rawDiscordLogToken = env.DISCORD_LOGS_WEBHOOK_TOKEN;
	let discordLogs: DiscordConfig | null = null;
	if (typeof rawDiscordLogId === 'string' && typeof rawDiscordLogToken === 'string') {
		discordLogs = {
			webhookId: rawDiscordLogId,
			webhookToken: rawDiscordLogToken
		};
	}

	const administrator = env.ADMIN ?? 'eb989f16-94a4-47ab-a4bb-151c3f529fac';

	const salt = env.SALT ?? 'eb989f16-94a4-47ab-a4bb-151c3f529fac';

	return {
		isProduction,
		port,
		wssPort,
		selfUrl,
		eternaltwin,
		discordPantheonNotifications,
		discordNewsNotifications,
		discordLogs,
		administrator,
		salt
	};
}

/**
 * Load the configuration from the ambient environment.
 *
 * As part of this resolution, if a `.env` file is present in the current
 * working directory, it is loaded and applied to the process environment.
 */
export function loadConfig(): Config {
	dotenv.config();
	return config(process.env);
}
