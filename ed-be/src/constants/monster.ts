import { MonsterFiche } from '../models/index.js';

export const monsterList: Readonly<Record<string, MonsterFiche>> = {
	GOUPIGNON: {
		name: 'goupignon',
		hp: 10,
		attack: 1,
		gold: 100,
		xp: 10,
		odds: 100,
		level: 1
	},
	WOLF: {
		name: 'wolf',
		hp: 15,
		attack: 1,
		gold: 500,
		xp: 20,
		odds: 80,
		level: 5
	},
	GLUON: {
		name: 'gluon',
		hp: 35,
		attack: 2,
		gold: 10000,
		xp: 25,
		odds: 20,
		level: 7
	},
	GREEN_GIANT: {
		name: 'greeng',
		hp: 70,
		attack: 3,
		gold: 10000,
		xp: 10,
		odds: 100,
		level: 14
	},
	COQ: {
		name: 'coq',
		hp: 80,
		attack: 3,
		gold: 10000,
		xp: 10,
		odds: 50,
		level: 21
	}
};
