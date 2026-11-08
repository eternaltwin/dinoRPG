import { createRequire } from 'node:module';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import ServerState from './utils/server/ServerState.js';

register('@opentelemetry/instrumentation/hook.mjs', pathToFileURL('./'));

const { loadConfig } = await import('./config/config.js');
const config = loadConfig();

const { initOpentelemetry } = await import('./openTelemetry.js');
const otelSdk = initOpentelemetry(config);
otelSdk.start();

const require = createRequire(import.meta.url);
require('express');

const { GLOBAL, LOGGER } = await import('./context.js');
await GLOBAL.init();

// Last safety net: a promise nobody awaits, or an exception thrown from a callback, is logged instead of
// stopping the server for every player. The code that raised it stays to be fixed; the logs point to it.
process.on('unhandledRejection', (reason: unknown) => {
	LOGGER.error(`Unhandled rejection: ${reason instanceof Error ? (reason.stack ?? reason.message) : reason}`);
});
process.on('uncaughtException', (error: Error) => {
	LOGGER.error(`Uncaught exception: ${error.stack ?? error.message}`);
});

ServerState.setReady(true);

const { mainWrapper } = await import('./server.js');
mainWrapper();
