/**
 * dino-renderer
 *
 * Renders a DinoRPG dino from its code string using @eternaltwin/dinorpg_animations + Puppeteer.
 *
 * Supports two render modes:
 *   - 'sdino' : small animated dino (portrait frame, standing position)
 *   - 'dino'  : big static portrait
 */

import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import puppeteer, { Browser, HTTPRequest } from 'puppeteer';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DinoType = 'sdino' | 'dino';

export interface RenderOptions {
	/** Scale factor applied to canvas dimensions. Default: 1 */
	scale?: number;
	/** Damage level for big portrait (0–3). Default: 0. Ignored for 'sdino'. */
	damages?: number;
}

// ─── Paths ───────────────────────────────────────────────────────────────────

function findPackageDir(start: string): string {
	let dir = start;
	while (true) {
		const candidate = path.join(dir, 'node_modules', '@eternaltwin', 'dinorpg_animations');
		if (fs.existsSync(candidate)) return candidate;
		const parent = path.dirname(dir);
		if (parent === dir) {
			throw new Error('Cannot find @eternaltwin/dinorpg_animations in node_modules');
		}
		dir = parent;
	}
}

const PACKAGE_DIR: string = findPackageDir(path.dirname(new URL(import.meta.url).pathname));
const ASSETS_DIR: string = path.join(PACKAGE_DIR, 'assets');
const CACHE_DIR: string = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'cache');
const PORT: number = 18433;

fs.mkdirSync(CACHE_DIR, { recursive: true });

// ─── Config ──────────────────────────────────────────────────────────────────

const MIN_VALID_SIZE: number = 500;
const READY_TIMEOUT: number = 15_000;
const SCREENSHOT_TIMEOUT: number = 10_000;

// ─── State ───────────────────────────────────────────────────────────────────

let httpServer: http.Server | null = null;
let browser: Browser | null = null;
const inFlight = new Map<string, Promise<Buffer>>();

// ─── Render queue ─────────────────────────────────────────────────────────────

let queueTail: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
	const p = queueTail.then(fn, fn) as Promise<T>;
	queueTail = p.catch(() => {});
	return p;
}

// ─── HTML template ───────────────────────────────────────────────────────────

function buildHtml(type: DinoType, code: string, damages: number): string {
	// On fixe les dimensions standard
	const width = 190;
	const height = 165;

	// Ajustement des ancres pour que le Dino soit bien centré dans 190x165
	// (Valeurs historiques de DinoRPG)
	const anchorX = 95;
	const anchorY = 82;

	const extraOptions = type === 'sdino' ? `pflag: false` : `damages: ${damages}`;

	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    html, body {
      margin: 0; padding: 0;
      width: ${width}px; height: ${height}px;
      background: transparent; overflow: hidden;
    }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="/dinorpg-animations-test.min.js"></script>
  <script>
    window.__dinoReadyFired = false;
    (function () {
      try {
        var renderer = DinoAnim.autoDetectRenderer({
          width: ${width},
          height: ${height},
          backgroundAlpha: 0,
          resolution: 1, // On reste en résolution 1:1 pour du 190x165
          antialias: true
        });
        document.body.appendChild(renderer.view);

        var stage = new DinoAnim.Container();
        var dinoInstance = new DinoAnim.${type}({
          data: ${JSON.stringify(code)},
          flip: 1,
          ${extraOptions}
        });
        stage.addChild(dinoInstance);

        // Positionnement au centre du canvas 190x165
        dinoInstance.x = ${anchorX};
        dinoInstance.y = ${anchorY};

        var frames = 0;
        function renderLoop() {
          renderer.render(stage);
          frames++;
          if (frames === 15) { window.__dinoReadyFired = true; }
          if (frames < 20) { requestAnimationFrame(renderLoop); }
        }
        renderLoop();
      } catch (e) { console.error(e); }
    })();
  </script>
</body>
</html>`;
}

// ─── HTTP server ─────────────────────────────────────────────────────────────

function startHttpServer(): Promise<void> {
	if (httpServer) return Promise.resolve();

	// On crée des serveurs statiques pour chaque dossier suspect du package
	const serveRoot = serveStatic(PACKAGE_DIR);
	const servePublic = serveStatic(path.join(PACKAGE_DIR, 'public'));
	const serveDist = serveStatic(path.join(PACKAGE_DIR, 'dist'));
	const serveAssets = serveStatic(path.join(PACKAGE_DIR, 'assets'));

	const server = http.createServer((req, res) => {
		const done = finalhandler(req, res);

		// Chaînage : on cherche dans public -> dist -> assets -> racine du package
		servePublic(req, res, () => {
			serveDist(req, res, () => {
				serveAssets(req, res, () => {
					serveRoot(req, res, done as any);
				});
			});
		});
	});

	return new Promise<void>((resolve, reject) => {
		server.listen(PORT, '127.0.0.1', () => {
			console.log(`[dino-renderer] Asset server listening on port ${PORT}`);
			httpServer = server;
			resolve();
		});
		server.on('error', reject);
	});
}

function stopHttpServer(): Promise<void> {
	return new Promise<void>(resolve => {
		if (!httpServer) return resolve();
		httpServer.close(() => {
			httpServer = null;
			resolve();
		});
	});
}

// ─── Browser ─────────────────────────────────────────────────────────────────

async function startBrowser(): Promise<void> {
	if (browser) return;
	browser = await puppeteer.launch({
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-web-security',
			'--use-gl=angle',
			'--use-angle=swiftshader', // Force le rendu WebGL via CPU (indispensable)
			'--ignore-gpu-blocklist',
			'--disable-software-rasterizer',
			'--disable-gpu-sandbox'
		]
	});
}

async function stopBrowser(): Promise<void> {
	if (!browser) return;
	await browser.close().catch(() => {});
	browser = null;
}

// ─── Core render ─────────────────────────────────────────────────────────────

async function renderPage(type: DinoType, code: string, opts: Required<RenderOptions>): Promise<Buffer> {
	if (!browser) throw new Error('Browser not started');

	const { scale } = opts;
	const html = buildHtml(type, code, scale);
	const width = type === 'sdino' ? Math.round(100 * scale) : 190;
	const height = type === 'sdino' ? Math.round(100 * scale) : 165;
	const RENDER_URL = `http://127.0.0.1:${PORT}/render`;

	const page = await browser.newPage();
	// DeviceScaleFactor 2 pour une meilleure netteté
	await page.setViewport({ width, height, deviceScaleFactor: 1 });

	try {
		// Redirection des logs du navigateur vers Node.js
		page.on('console', msg => console.log(`[puppeteer:${type}]`, msg.text()));
		page.on('pageerror', err => console.error(`[puppeteer:error]`, err.message));

		await page.setRequestInterception(true);
		page.on('request', (req: HTTPRequest) => {
			if (req.url() === RENDER_URL) {
				void req.respond({ status: 200, contentType: 'text/html', body: html });
			} else {
				void req.continue();
			}
		});

		// Navigation initiale
		await page.goto(RENDER_URL, {
			waitUntil: 'domcontentloaded',
			timeout: READY_TIMEOUT
		});

		// ATTENTE DU SIGNAL : On surveille window.__dinoReadyFired
		await page
			.waitForFunction('window.__dinoReadyFired === true', {
				timeout: READY_TIMEOUT,
				polling: 100
			})
			.catch(async e => {
				// Si timeout, on vérifie si une erreur JS est survenue dans le navigateur
				// On passe une string, comme ça TypeScript ne l'analyse pas du tout
				const browserErr = await page.evaluate('window.__dinoError').catch(() => null);
				throw new Error(browserErr ? `Browser script error: ${browserErr}` : 'Dino ready timeout');
			});

		// Petit sursis pour laisser le buffer WebGL se stabiliser
		await new Promise(r => setTimeout(r, 100));

		// Capture d'écran (PNG transparent)
		const buf = (await page.screenshot({
			type: 'png',
			omitBackground: true,
			clip: { x: 0, y: 0, width, height }
		})) as Buffer;

		return buf;
	} finally {
		await page.close().catch(() => {});
	}
}

async function doRender(type: DinoType, code: string, opts: Required<RenderOptions>): Promise<Buffer> {
	try {
		return await renderPage(type, code, opts);
	} catch (err) {
		console.warn('[dino-renderer] render failed, restarting browser and retrying:', (err as Error)?.message);
		await stopBrowser().catch(() => {});
		await startBrowser();
		return await renderPage(type, code, opts);
	}
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function start(): Promise<void> {
	await startHttpServer();
	await startBrowser();
}

export async function stop(): Promise<void> {
	await stopBrowser();
	await stopHttpServer();
}

export function renderDino(type: DinoType, code: string, opts: RenderOptions = {}): Promise<Buffer> {
	const resolvedOpts: Required<RenderOptions> = {
		scale: opts.scale ?? 1,
		damages: opts.damages ?? 0
	};

	const safe = code.replace(/[^0-9A-Za-z]/g, '');
	const cacheKey = `${type}_${safe}_s${resolvedOpts.scale}_d${resolvedOpts.damages}`;
	const cachePath = path.join(CACHE_DIR, `${cacheKey}.png`);

	if (fs.existsSync(cachePath)) {
		const { size } = fs.statSync(cachePath);
		if (size >= MIN_VALID_SIZE) return Promise.resolve(fs.readFileSync(cachePath));
		fs.unlinkSync(cachePath);
	}

	const existing = inFlight.get(cacheKey);
	if (existing) return existing;

	const promise = enqueue(async () => {
		await start();
		return doRender(type, code, resolvedOpts);
	})
		.then((buf: Buffer) => {
			fs.writeFileSync(cachePath, buf);
			inFlight.delete(cacheKey);
			return buf;
		})
		.catch((err: unknown) => {
			inFlight.delete(cacheKey);
			throw err;
		});

	inFlight.set(cacheKey, promise);
	return promise;
}

export const renderSdino = (code: string, opts?: RenderOptions): Promise<Buffer> => renderDino('sdino', code, opts);

export const renderBigDino = (code: string, opts?: RenderOptions): Promise<Buffer> => renderDino('dino', code, opts);
