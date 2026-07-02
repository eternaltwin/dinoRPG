/**
 * Loads the dungeon tileset PNGs (copied from the archive's dungeon/dungeon/dungeon)
 * once, then hands out cached Pixi textures by bare tile name.
 */

import { Assets, Texture } from 'pixi.js';

const cache = new Map<string, Texture>();
const url = (name: string): string => `${import.meta.env.BASE_URL}dungeon/gfx/${name}.png`;

/** Preload the given tile names. Safe to call once at startup. */
export async function loadDungeonAssets(names: string[]): Promise<void> {
	const urls = names.map(url);
	const map = (await Assets.load(urls)) as Record<string, Texture>;
	names.forEach((n, i) => cache.set(n, map[urls[i]]));
}

/** Cached texture for a tile name (falls back to white if not preloaded). */
export function gfx(name: string): Texture {
	return cache.get(name) ?? Texture.WHITE;
}
