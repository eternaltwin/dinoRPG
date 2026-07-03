/** Dungeon tileset loading (src/assets/dungeon). */

import { Assets, Texture } from 'pixi.js';
import { ITEM_ASSETS } from '@drpg/core/models/dungeon/DungeonClient';
import type { Skin } from '@drpg/core/models/dungeon/DungeonClient';

const ASSET_URLS = import.meta.glob('../../assets/dungeon/*.png', { eager: true, as: 'url' }) as Record<string, string>;
export const assetUrl = (name: string): string => ASSET_URLS[`../../assets/dungeon/${name}.png`] ?? '';

const textures = new Map<string, Texture>();

/** Preload the given tile names so {@link gfx} resolves synchronously. */
export async function loadDungeonAssets(names: string[]): Promise<void> {
	await Promise.all(names.map(async n => textures.set(n, (await Assets.load(assetUrl(n))) as Texture)));
}

/** Cached texture for a tile name (falls back to white if not preloaded). */
export const gfx = (name: string): Texture => textures.get(name) ?? Texture.WHITE;

export const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

/** Tile names one run needs: shared items + a single skin's tiles (for lazy preloading). */
export function skinAssetNames(skin: Skin): string[] {
	const set = new Set<string>(ITEM_ASSETS);
	set.add(`side_${skin.name}_01`);
	set.add(`back_${skin.name}_01`);
	set.add(`corner_${skin.name}_01`);
	for (let i = 1; i <= skin.frontCount; i++) set.add(`front_${skin.name}_${pad2(i)}`);
	for (let i = 1; i <= skin.groundCount; i++) set.add(`ground_${skin.ground}_${pad2(i)}`);
	return [...set];
}
