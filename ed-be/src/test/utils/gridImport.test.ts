import { describe, it, expect } from 'vitest';
import {
	checkScenarios,
	scenarioCount,
	scenariosFromStruct,
	structFromGrid
} from '../../business/dungeon/gridImport.js';
import { Item } from '@drpg/core/models/item/ItemList';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { DungeonCodec } from '../../business/dungeon/DungeonCodec.js';
import type { DungeonGrid } from '@drpg/core/models/dungeon/DungeonEditor';

/** 16×16, all floor, easy to poke holes into. */
function blankGrid(levels = 2): DungeonGrid {
	return {
		width: 16,
		height: 16,
		levels: Array.from({ length: levels }, () => ({
			floor: Array.from({ length: 16 }, () => '1'.repeat(16)),
			doors: [],
			items: []
		})),
		start: { x: 1, y: 1, l: 0 },
		exit: { x: 14, y: 14, l: levels - 1 }
	};
}

describe('structFromGrid', () => {
	it('round-trips a grid with stairs, monster, locked door and items through the codec', () => {
		const g = blankGrid(2);
		g.levels[0].floor[5] = '1'.repeat(4) + '0'.repeat(8) + '1'.repeat(4); // carve some wall
		g.levels[0].doors = [
			{ x: 8, y: 8, up: true, key: null }, // stair up…
			{ x: 3, y: 3, up: null, key: null }, // monster spot
			{ x: 6, y: 2, up: null, key: 7 } // locked door
		];
		g.levels[1].doors = [{ x: 8, y: 8, up: false, key: null }]; // …paired stair down
		g.levels[0].items = [
			{ x: 10, y: 2, k: 0, v: 7 }, // key — same chunk as the gold below
			{ x: 12, y: 2, k: 1, v: 50 } // gold
		];
		g.levels[1].items = [{ x: 4, y: 4, k: 3, v: 0 }]; // scenario

		const d = structFromGrid(g);
		const encoded = new DungeonCodec().encode(d);
		const codec = new DungeonCodec();
		expect(codec.decode(encoded)).toBe(true);
		const r = codec.d;

		expect(r.width).toBe(16);
		expect(r.levels.length).toBe(2);
		expect(r.start).toEqual({ x: 1, y: 1, l: 0 });
		expect(r.exit).toEqual({ x: 14, y: 14, l: 1 });
		// Floor tables survive exactly (wall row included).
		for (let l = 0; l < 2; l++) {
			for (let x = 0; x < 16; x++) {
				for (let y = 0; y < 16; y++) {
					expect(r.levels[l].table[x][y]).toBe(g.levels[l].floor[y][x] === '1');
				}
			}
		}
		// Every door and item is present at its cell with the right payload.
		const doors = (l: number) => r.levels[l].rooms.flatMap(room => room.doors);
		expect(doors(0)).toEqual(
			expect.arrayContaining([
				{ x: 8, y: 8, up: true, key: null },
				{ x: 3, y: 3, up: null, key: null },
				{ x: 6, y: 2, up: null, key: 7 }
			])
		);
		expect(doors(0)).toHaveLength(3);
		expect(doors(1)).toEqual([{ x: 8, y: 8, up: false, key: null }]);
		const items = (l: number) => r.levels[l].rooms.map(room => room.item).filter(i => i != null);
		expect(items(0)).toEqual(
			expect.arrayContaining([
				{ x: 10, y: 2, k: 0, v: 7 },
				{ x: 12, y: 2, k: 1, v: 50 }
			])
		);
		expect(items(1)).toEqual([{ x: 4, y: 4, k: 3, v: 0 }]);
	});

	it('rejects a door on a wall cell', () => {
		const g = blankGrid(1);
		g.levels[0].floor[0] = '0'.repeat(16);
		g.levels[0].doors = [{ x: 5, y: 0, up: null, key: null }];
		expect(() => structFromGrid(g)).toThrow(/not on a floor cell/);
	});

	it('rejects a key index above 63', () => {
		const g = blankGrid(1);
		g.levels[0].doors = [{ x: 5, y: 5, up: null, key: 64 }];
		expect(() => structFromGrid(g)).toThrow(/door key/);
	});

	it('rejects a stair up on the top floor', () => {
		const g = blankGrid(1);
		g.levels[0].doors = [{ x: 5, y: 5, up: true, key: null }];
		expect(() => structFromGrid(g)).toThrow(/no level above/);
	});

	it('rejects two entities on the same cell', () => {
		const g = blankGrid(1);
		g.levels[0].doors = [{ x: 5, y: 5, up: null, key: null }];
		g.levels[0].items = [{ x: 5, y: 5, k: 1, v: 10 }];
		expect(() => structFromGrid(g)).toThrow(/overlaps/);
	});
});

describe('scenariosFromStruct', () => {
	/** A layout carrying two scenario items, numbered 0 and 1. */
	function twoScenarioStruct() {
		const g = blankGrid(1);
		g.levels[0].items = [
			{ x: 4, y: 4, k: 3, v: 0 },
			{ x: 6, y: 6, k: 3, v: 1 }
		];
		return structFromGrid(g);
	}

	it('counts the entries a layout needs', () => {
		expect(scenarioCount(twoScenarioStruct())).toBe(2);
		expect(scenarioCount(structFromGrid(blankGrid(1)))).toBe(0);
	});

	it('gives every scenario item a key — the import that silently stored []', () => {
		expect(scenariosFromStruct(twoScenarioStruct(), [])).toEqual([
			{ text: 'scenario_0', icon: 'chest' },
			{ text: 'scenario_1', icon: 'chest' }
		]);
	});

	it('keeps what the admin wrote and only fills the gaps', () => {
		const written = checkScenarios([{ text: 'mandragore_note', icon: 'scroll' }]);
		expect(scenariosFromStruct(twoScenarioStruct(), written)).toEqual([
			{ text: 'mandragore_note', icon: 'scroll', obj: undefined, count: undefined, collec: undefined },
			{ text: 'scenario_1', icon: 'chest' }
		]);
	});

	it('leaves a longer list alone', () => {
		const rows = checkScenarios([{ text: 'a' }, { text: 'b' }, { text: 'c' }]);
		expect(scenariosFromStruct(twoScenarioStruct(), rows)).toHaveLength(3);
	});
});

describe('checkScenarios', () => {
	it('keeps valid entries and trims the key', () => {
		expect(
			checkScenarios([
				{ text: ' irma_chest ', icon: 'chest', obj: Item.POTION_IRMA, count: 3 },
				{ text: 'demon_scroll', icon: 'scroll', collec: Reward.DEMON }
			])
		).toEqual([
			{ text: 'irma_chest', icon: 'chest', obj: Item.POTION_IRMA, count: 3, collec: undefined },
			{ text: 'demon_scroll', icon: 'scroll', obj: undefined, count: undefined, collec: Reward.DEMON }
		]);
	});

	it('rejects a sentence: the text is an i18n key, never the string shown to the player', () => {
		expect(() => checkScenarios([{ text: 'Un coffre !' }])).toThrow(/i18n key/);
		expect(() => checkScenarios([{ text: '.leading-dot' }])).toThrow(/i18n key/);
	});

	it('rejects an empty text, an unknown item and a bad icon', () => {
		expect(() => checkScenarios([{ text: '  ' }])).toThrow(/needs a text/);
		expect(() => checkScenarios([{ text: 'ok', obj: 999999 }])).toThrow(/unknown item/);
		expect(() => checkScenarios([{ text: 'ok', icon: 'skel' }])).toThrow(/icon/);
	});
});

describe('an imported Motion Twin layout', () => {
	// A real 50x50x4 string pasted into the admin import field. Its "4S" signature is not
	// decoration: the payload carries four IScenario items, and the dungeon it produces is
	// only playable if the stored scenario list has an entry for each of them.
	const LAYOUT =
		'[[50x50x4 141R 110M 4S 6K]]mJieqtmYNgsKuuzZgXnout0McEkgmg4xIA8ukGCQmyzteCXhkqMmzbDKreKznHGwche3u2jtekZHHVYkeGWuIIIgkcYXabkwfhvfiKlnTwSabbGgCuvtyqKChpclbJQIiQUlTHGPeb04ZjeEjifWkGQuQtlEsBPii9mnIgOi7wJnJqNWJBmm6gdGLgUwiCnjeJqWZukMKHoKtjCBbmoAkkQf4sUbcOrudiguKHs0unwcCHgmfnelKejEmmfffiSOjlSmTkmiOOQycjcccJAzzzBivJilcmQtuYqdWvdkkjrv9akOjaaYXJHeTfNrM2eXMmNjokMPOQkIQAMzruXqk4tb8tugunoWu1gOSlq8kmGksOaeEyOABMzPOOjcncpadAPouOK5IAAzaMLkOtAneKJuO1SW13qK8XrTttMGKNyzga6QoAoionwknQucS_dwsdfAGwueq5NIKGB6dafhcdMIMcQ6qaOAqK6fjabcPtnftOzPgK7k5YbrOarqmzrrqdAYfcLmISqCqCMALaecJOXHOOItDL35mMuAkkOHsQ1ACzbsq6jzzssfefmcqOmGWuIIXMJriCChgIZJ0fjfeIHmNsOGWGyOKAAbinYI8TjiDZC1rudyBCcXqBiYdDsHwXvS0OygoDbvSvtCxImqmZlkDrorlemvlgujZkkeOxIShW8fjeKKuIYKKLmajmzcJmSqQ0gLarHNnsYKMeeDHgcGVXfigY0Ait8nhdi3sesssriz34WmGMHjnkXqxXKkcqNcsirWXgeqWm9zuWXKrK8QqI3zxncMKIf5wuZMuAuRpioE6ZbRWfvdpmmulkQeq9uogmK2QQAMPGdkgkI02MzLmeTqvuSDkG00Znzm3v1z3MYIeOMmoOiKwDjMwKbyMmWm7jiayCG61csoOIvie51vvy2nNr0C6LGjjKiuK1mkAGjCuC0vhKJKYtmKPapPMmM2PQBBsajJhHJfYi96nHXqiOXIPqGrWqAcaJhCHhdOWzacGyZcAMPOs4CMncarJrQeGsbhdjDiqH4iBcPILknIIs2Ig0jTCtvIMYY5yzcuKKg1E4learGJguuWXb2qivvDTbaJCPlAjD5yALmOYg5qQ5kYErYeic2MursZSCCTNiym3m2YgYUiYdic2wqOsvoyauYiG2YuGbQHLsmZmHhQrbXsxssseuBgNWgyAn7OioHdLHWHrHfiOPaNcacl0JqKQPMOMAjRcuvKnOASWACda1YHNckvRcxowey3uq7rlNn0qlDOSTtXZkzOAgAMLKbPIXHLHXTfM7brSfUvskG0vJmOLeTKSlsSqwgKPAZoGksXGqtQecAZsZy2nJziOHdHtaAIIHSPPTttUKj8yHiXetPZnMHOM2zPfHHHJAIsePLMzYIQbDtKYb00MBM5UCK0nesgXjsKjlmMzCYMS9ITjzdiCuvm1oQSQUKWuIHsbrsKjjlnKsiKCfjGrsHTgPksjSqf4vhXmZu0vfrZCZnKPHCIdHkfwzXbUCqBpeQ6Uaq20egkwfBpw1XjSzI20IXknsSeCMmqi0lkljy4zAkABPXGnaYHnkOG6ak2gGJhnfbqdPWqT1zjbURfAswgriyy3mKsHmOlkuJekoJukXiQwIirrHfeQOdrXHHeOPLfczpXx0zpkmO4mYkQAMPXHSPsmNswrg0cuSnkgyTtrmXihX5mbUgnMGivWJR9yX1kdfxyAXA1QsJfYuuboACyQusQmgC0WfzWPGZTMQes7W1fc6ZJdk3bkRPLOIa8O0aZQDbjepudsYUWzAjPG2wKasnegeuuurunuRmJMgCmZoOHLNcAIJnQAMMAhqC5OfPqvPmOy2uWQMWoezrrozchck3XOOZyZkaEHit4GWYadpPioczMPQQkAQCHma0yy7Ke8GGbonaYIJPkjqcjYcbLPiPjk4vZHsUuZ3gC0qgPWbASdSHf6';

	it('lands with one i18n key per scenario item', () => {
		const codec = new DungeonCodec();
		expect(codec.decode(LAYOUT)).toBe(true);
		expect(scenarioCount(codec.d)).toBe(4);
		expect(scenariosFromStruct(codec.d, checkScenarios(undefined))).toEqual([
			{ text: 'scenario_0', icon: 'chest' },
			{ text: 'scenario_1', icon: 'chest' },
			{ text: 'scenario_2', icon: 'chest' },
			{ text: 'scenario_3', icon: 'chest' }
		]);
	});
});
