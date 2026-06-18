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

const { GLOBAL } = await import('./context.js');
await GLOBAL.init();

ServerState.setReady(true);

const { mainWrapper } = await import('./server.js');
mainWrapper();
