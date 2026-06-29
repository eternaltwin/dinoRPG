/**
 * MazeRenderer — draws a decoded {@link DungeonStruct} with Pixi.js.
 *
 * One level is shown at a time. Walls/floors come from the level `table`;
 * doors, items, start and exit are drawn as coloured markers. A separate
 * `actorLayer` is exposed so the dinoz can be added above the maze.
 */

import { Application, Container, Graphics, Text } from 'pixi.js';
import { DungeonItem } from '../dungeon/types';
import type { DungeonStruct, DungeonLevel } from '../dungeon/types';

export interface RendererOptions {
	cell?: number;
	background?: number;
}

const COLORS = {
	floor: 0x2b2f3a,
	floorAlt: 0x262a33,
	wall: 0x12141b,
	grid: 0x1b1e26,
	start: 0x4caf50,
	exit: 0x9c27b0,
	doorMonster: 0xe53935,
	doorLocked: 0xffb300,
	doorStairUp: 0x29b6f6,
	doorStairDown: 0x1565c0,
	itemKey: 0xffd54f,
	itemGold: 0xffca28,
	itemHeal: 0x66bb6a,
	itemScenario: 0xab47bc
};

export class MazeRenderer {
	readonly app: Application;
	readonly cell: number;
	readonly actorLayer: Container;
	private readonly mapLayer: Container;
	private d: DungeonStruct | null = null;
	private level = 0;

	constructor(parent: HTMLElement, d: DungeonStruct, opts: RendererOptions = {}) {
		this.cell = opts.cell ?? 16;
		this.app = new Application({
			width: d.width * this.cell,
			height: d.height * this.cell,
			background: opts.background ?? 0x0c0d12,
			antialias: true
		});
		parent.appendChild(this.app.view as HTMLCanvasElement);

		this.mapLayer = new Container();
		this.actorLayer = new Container();
		this.app.stage.addChild(this.mapLayer);
		this.app.stage.addChild(this.actorLayer);

		this.setDungeon(d);
	}

	get currentLevel(): number {
		return this.level;
	}

	get levelCount(): number {
		return this.d?.levels.length ?? 0;
	}

	/** Pixel center of cell (x, y). */
	center(x: number, y: number): { x: number; y: number } {
		return { x: x * this.cell + this.cell / 2, y: y * this.cell + this.cell / 2 };
	}

	setDungeon(d: DungeonStruct): void {
		this.d = d;
		this.app.renderer.resize(d.width * this.cell, d.height * this.cell);
		this.showLevel(Math.min(this.level, d.levels.length - 1));
	}

	showLevel(l: number): void {
		if (!this.d) return;
		this.level = Math.max(0, Math.min(l, this.d.levels.length - 1));
		this.mapLayer.removeChildren();
		this.drawTable(this.d.levels[this.level]);
		this.drawMarkers(this.d, this.level);
	}

	private drawTable(level: DungeonLevel): void {
		if (!this.d) return;
		const g = new Graphics();
		const c = this.cell;
		for (let x = 0; x < this.d.width; x++) {
			for (let y = 0; y < this.d.height; y++) {
				const walkable = level.table[x]?.[y] ?? false;
				g.beginFill(walkable ? ((x + y) & 1 ? COLORS.floor : COLORS.floorAlt) : COLORS.wall);
				g.drawRect(x * c, y * c, c, c);
				g.endFill();
			}
		}
		this.mapLayer.addChild(g);
	}

	private drawMarkers(d: DungeonStruct, l: number): void {
		const g = new Graphics();
		const r = this.cell * 0.32;

		for (const room of d.levels[l].rooms) {
			for (const door of room.doors) {
				let color = COLORS.doorMonster;
				if (door.key != null) color = COLORS.doorLocked;
				else if (door.up === true) color = COLORS.doorStairUp;
				else if (door.up === false) color = COLORS.doorStairDown;
				const p = this.center(door.x, door.y);
				g.beginFill(color);
				g.drawRect(p.x - r, p.y - r, r * 2, r * 2);
				g.endFill();
			}
			if (room.item) {
				const p = this.center(room.item.x, room.item.y);
				g.beginFill(this.itemColor(room.item.k));
				g.drawCircle(p.x, p.y, r);
				g.endFill();
			}
		}

		if (d.start.l === l) this.drawFlag(g, d.start.x, d.start.y, COLORS.start);
		if (d.exit.l === l) this.drawFlag(g, d.exit.x, d.exit.y, COLORS.exit);
		this.mapLayer.addChild(g);

		const label = new Text(`Level ${l + 1} / ${d.levels.length}`, {
			fill: 0xffffff,
			fontSize: 13,
			fontFamily: 'monospace'
		});
		label.position.set(6, 6);
		this.mapLayer.addChild(label);
	}

	private drawFlag(g: Graphics, x: number, y: number, color: number): void {
		const p = this.center(x, y);
		const s = this.cell * 0.42;
		g.lineStyle(2, color, 1);
		g.beginFill(color, 0.35);
		g.drawCircle(p.x, p.y, s);
		g.endFill();
		g.lineStyle(0);
	}

	private itemColor(k: DungeonItem): number {
		switch (k) {
			case DungeonItem.IKey:
				return COLORS.itemKey;
			case DungeonItem.IGold:
				return COLORS.itemGold;
			case DungeonItem.IHeal:
				return COLORS.itemHeal;
			default:
				return COLORS.itemScenario;
		}
	}

	destroy(): void {
		this.app.destroy(true, { children: true });
	}
}
