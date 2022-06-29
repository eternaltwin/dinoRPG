import { Action } from '../models';

export const actionList: Readonly<Record<string, Action>> = {
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
	}
};
