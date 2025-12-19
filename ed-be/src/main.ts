import { initOpentelemetry } from './openTelemetry.js';
import { loadConfig } from './config/config.js';
import { GLOBAL } from './context.js';
import ServerState from './utils/ServerState.js';

async function main() {
	const config = loadConfig();
	const otelSdk = initOpentelemetry(config);
	otelSdk.start();
	await GLOBAL.init();

	ServerState.setReady(true);
	// eslint-disable-next-line node/no-unsupported-features/es-syntax
	const server = await import('./server.js');
	server.mainWrapper();
}

await main();
