import { MonsterFiche } from '../models/index.js';

export const monsterList: Readonly<Record<string, MonsterFiche>> = {
	GOUPIGNON: {
		name: 'goupignon',
		hp: 10,
		attack: 1,
		gold: 100,
		xp: 10,
		odds: 100
	},
	WOLF: {
		name: 'wolf',
		hp: 25,
		attack: 5,
		gold: 500,
		xp: 20,
		odds: 20
	},
	ANGRY_DEV: {
		name: 'angry_dev',
		hp: 100,
		attack: 100,
		gold: 10000,
		xp: 100,
		odds: 1
	}
};
