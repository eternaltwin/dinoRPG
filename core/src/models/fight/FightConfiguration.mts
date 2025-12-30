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

export interface FightConfiguration {
	// Seed
	seed: string;

	// (Optional) Timeout, forces the fight to end after some time has elapsed
	timeout?: number;

	// Flags
	castleFight: boolean;
	canUseCapture: boolean;
	enableStats: boolean;

	// Teams
	attackerHasCook: boolean;
	defenderHasCook: boolean;

	// Fighters
	initialDinozList: DinozToGetFighter[];
	fighters: DetailedFighter[];

	// Place
	place: PlaceEnum;
}
