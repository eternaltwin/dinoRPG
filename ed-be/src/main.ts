import ServerState from './utils/ServerState.js';

async function main() {
    const { loadConfig } = await import('./config/config.js');
    const config = loadConfig();
    
    const { initOpentelemetry } = await import('./openTelemetry.js');
    const otelSdk = initOpentelemetry(config);
    otelSdk.start(); // <-- OTel est initialisé AVANT tout le reste
    
    const { GLOBAL } = await import('./context.js');
    await GLOBAL.init();

    ServerState.setReady(true);
    const server = await import('./server.js');
    server.mainWrapper();
}

await main();
