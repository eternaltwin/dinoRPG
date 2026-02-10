import { Dinoz, DinozCatch, DinozItem, DinozSkill, DinozStatus } from '@drpg/prisma';
import { DetailedFighter } from './DetailedFighter.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';

export type DinozToGetFighter = Pick<
	Dinoz,
	| 'id'
	| 'level'
	| 'name'
	| 'life'
	| 'maxLife'
	| 'nbrUpFire'
	| 'nbrUpWood'
	| 'nbrUpWater'
	| 'nbrUpLightning'
	| 'nbrUpAir'
	| 'display'
> & {
	playerId: string | null;
	items: Pick<DinozItem, 'itemId'>[];
	skills: Pick<DinozSkill, 'skillId'>[];
	status: Pick<DinozStatus, 'statusId'>[];
	catches: Pick<DinozCatch, 'id' | 'hp' | 'monsterId'>[];
};

export interface FightRules {
	castleFight: boolean;
	canUseCapture: boolean;
	enableStats: boolean;
	poisonEnabled: boolean;
	canUseEquipment: boolean;
	// Permanent means non-consumable.
	canUsePermanentEquipmentOnly: boolean;
}

// Regular fight rules: no castle, no stats, capture enabled, poison enabled, all equipment.
export const MONSTER_FIGHT_RULES: FightRules = {
	castleFight: false,
	canUseCapture: true,
	enableStats: false,
	poisonEnabled: true,
	canUseEquipment: true,
	canUsePermanentEquipmentOnly: false
};

// Dojo challenge rules: no castle, no capture, stats enabled, poison enabled, only permanent equipment.
export const DOJO_CHALLENGE_RULES: FightRules = {
	castleFight: false,
	canUseCapture: false,
	enableStats: true,
	poisonEnabled: true,
	canUseEquipment: true,
	canUsePermanentEquipmentOnly: true
};

// Regular PVP fight rules: no castle, no stats, no capture, poison enabled, all equipment.
export const STANDARD_PVP_RULES: FightRules = {
	castleFight: false,
	canUseCapture: false,
	enableStats: false,
	poisonEnabled: true,
	canUseEquipment: true,
	canUsePermanentEquipmentOnly: false
};

export interface FightConfiguration {
	// Seed
	seed: string;

	// (Optional) Timeout, forces the fight to end after some time has elapsed
	timeout?: number;

	// rules
	rules: FightRules;

	// Teams
	attackerHasCook: boolean;
	defenderHasCook: boolean;

	// Fighters
	initialDinozList: DinozToGetFighter[];
	fighters: DetailedFighter[];

	// Place
	place: PlaceEnum;
}
