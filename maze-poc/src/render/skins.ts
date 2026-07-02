/**
 * Dungeon skins — derived from the `SKINS` table in the archive's
 * `dungeon/dungeon/View.hx`, restricted to the tilesets actually exported as PNGs
 * under `dungeon/dungeon/dungeon/`.
 *
 * Each skin pairs a wall theme (`name`, used for front/side/back/corner tiles)
 * with a ground theme and a fog background colour. Variant counts match the
 * files on disk so the renderer only ever references tiles that exist.
 */

export interface Skin {
	/** Wall theme — front_/side_/back_/corner_<name>. */
	name: string;
	/** Ground theme — ground_<ground>. */
	ground: string;
	frontCount: number;
	groundCount: number;
	/** Background / fog colour (from View.hx). */
	fog: number;
}

export const SKINS: Skin[] = [
	{ name: 'cavern', ground: 'cavern', frontCount: 4, groundCount: 5, fog: 0x392429 },
	{ name: 'crypt', ground: 'crypt', frontCount: 3, groundCount: 7, fog: 0x27191c },
	{ name: 'egypt', ground: 'sand', frontCount: 6, groundCount: 6, fog: 0x433023 },
	{ name: 'forest', ground: 'grass', frontCount: 1, groundCount: 6, fog: 0x30371e },
	{ name: 'hell', ground: 'hell', frontCount: 4, groundCount: 5, fog: 0x330d0d },
	{ name: 'ruin', ground: 'cavern', frontCount: 6, groundCount: 5, fog: 0x252730 },
	{ name: 'sewer', ground: 'sewer', frontCount: 4, groundCount: 7, fog: 0x37321e },
	{ name: 'stone', ground: 'crypt', frontCount: 2, groundCount: 7, fog: 0x352c20 }
];

/** Sprites shared by every skin (items, doors, stairs). */
export const ITEM_ASSETS = [
	'item_chest',
	'item_gold',
	'item_key_01',
	'item_scroll',
	'item_skel',
	'item_door_h_01',
	'item_door_v_01',
	'item_stair_up',
	'item_stair_down'
];

export function pad2(n: number): string {
	return n < 10 ? `0${n}` : `${n}`;
}

/** Tile names a single skin needs. */
export function skinAssetNames(skin: Skin): string[] {
	const names = [`side_${skin.name}_01`, `back_${skin.name}_01`, `corner_${skin.name}_01`];
	for (let i = 1; i <= skin.frontCount; i++) names.push(`front_${skin.name}_${pad2(i)}`);
	for (let i = 1; i <= skin.groundCount; i++) names.push(`ground_${skin.ground}_${pad2(i)}`);
	return names;
}

/** Every tile name the POC can use, de-duplicated (for preloading). */
export function allAssetNames(): string[] {
	const set = new Set<string>(ITEM_ASSETS);
	for (const s of SKINS) for (const n of skinAssetNames(s)) set.add(n);
	return [...set];
}
