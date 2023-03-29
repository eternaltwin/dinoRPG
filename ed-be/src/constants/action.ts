import { ActionFiche } from '@drpg/core/models/dinoz/DinozFiche';

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
	},
	NPC: {
		name: 'npc',
		imgName: 'act_talk'
	},
	RESURRECT: {
		name: 'resurrect',
		imgName: 'act_resurrect'
	},
	MISSION: {
		name: 'mission',
		imgName: 'act_mission'
	},
	DIG: {
		name: 'dig',
		imgName: 'act_dig'
	}
};
