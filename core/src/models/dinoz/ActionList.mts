import { GatherType } from "../enums/GatherType.mjs";

export enum Action {
	FIGHT = 'fight',
	FOLLOW = 'follow',
	SHOP = 'shop',
	LEVEL_UP = 'levelup',
	NPC = 'npc',
	RESURRECT = 'resurrect',
	MISSION = 'mission',
	DIG = 'dig',
	CONCENTRATE = 'concentrate',
	MARKET = 'market',
	FISH = 'fish',
	CUEILLE = 'cueille',
	ENERGY = 'energy',
	HUNT = 'hunt',
	SEEK = 'seek',
	ANNIV = 'anniv',
};

export interface ActionFiche {
	name: Action | GatherType;
	imgName: string;
	prop?: number | string;
	special?: boolean;
}

export const actionList: Readonly<Record<Action, ActionFiche>> = {
	[Action.FIGHT]: {
		name: Action.FIGHT,
		imgName: 'act_fight'
	},
	[Action.FOLLOW]: {
		name: Action.FOLLOW,
		imgName: 'act_follow'
	},
	[Action.SHOP]: {
		name: Action.SHOP,
		imgName: 'act_shop'
	},
	[Action.LEVEL_UP]: {
		name: Action.LEVEL_UP,
		imgName: 'act_levelup'
	},
	[Action.NPC]: {
		name: Action.NPC,
		imgName: 'act_talk'
	},
	[Action.RESURRECT]: {
		name: Action.RESURRECT,
		imgName: 'act_resurrect'
	},
	[Action.MISSION]: {
		name: Action.MISSION,
		imgName: 'act_mission'
	},
	[Action.DIG]: {
		name: Action.DIG,
		imgName: 'act_dig'
	},
	//TODO: display text for front
	[Action.CONCENTRATE]: {
		name: Action.CONCENTRATE,
		imgName: 'act_default'
	},
	[Action.MARKET]: {
		name: Action.MARKET,
		imgName: 'act_talk'
	},
	[Action.FISH]: {
		name: Action.FISH,
		imgName: 'act_default'
	},
	[Action.CUEILLE]: {
		name: Action.CUEILLE,
		imgName: 'act_default'
	},
	[Action.ENERGY]: {
		name: Action.ENERGY,
		imgName: 'act_default'
	},
	[Action.HUNT]: {
		name: Action.HUNT,
		imgName: 'act_default'
	},
	[Action.SEEK]: {
		name: Action.SEEK,
		imgName: 'act_default'
	},
	[Action.ANNIV]: {
		name: Action.ANNIV,
		imgName: 'act_default'
	}
};
