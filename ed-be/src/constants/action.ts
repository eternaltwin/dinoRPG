import { ActionFiche } from '../models/index.js';

export const actionList: Readonly<Record<string, ActionFiche>> = {
	FIGHT: {
		name: 'fight',
		imgName: 'act_fight'
	},
	FOLLOW: {
		name: 'follow',
		imgName: 'act_follow'
	},
	SHOP: {
		name: 'shop',
		imgName: 'act_shop'
	},
	LEVEL_UP: {
		name: 'levelup',
		imgName: 'act_levelup'
	}
};
