/**
 * Admin dungeon-builder contract: the hand-drawn grid the editor panel sends
 * to POST /admin/dungeon. The backend converts it to a DungeonStruct
 * (ed-be/src/business/dungeon/gridImport.ts) — the codec never runs FE-side.
 */

/** Same semantics as the backend DungeonDoor: up=true/false stairs, up=null+key=null monster spot, up=null+key set locked door. */
export interface DungeonGridDoor {
	x: number;
	y: number;
	up: boolean | null;
	key: number | null;
}

/** k: 0 key, 1 gold, 2 heal, 3 scenario (DungeonItem indices); v is the item value (key index, scenario index…). */
export interface DungeonGridItem {
	x: number;
	y: number;
	k: number;
	v: number;
}

export interface DungeonGridLevel {
	/** `height` rows of `width` chars, '1' = floor, '0' = wall; floor[y][x]. */
	floor: string[];
	doors: DungeonGridDoor[];
	items: DungeonGridItem[];
}

export interface DungeonGrid {
	width: number;
	height: number;
	levels: DungeonGridLevel[];
	start: { x: number; y: number; l: number };
	exit: { x: number; y: number; l: number };
}
