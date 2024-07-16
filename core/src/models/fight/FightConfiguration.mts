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
	items: Pick<DinozItem, 'itemId'>[];
	skills: Pick<DinozSkill, 'skillId'>[];
	status: Pick<DinozStatus, 'statusId'>[];
	catches: Pick<DinozCatch, 'id' | 'hp' | 'monsterId'>[];
};

export interface FightConfiguration {
	// Seed (optional, only to replay a fight)
	seed?: number;

	// Flags
	canUseEquipment: boolean;
	canUsePermanentEquipmentOnly: boolean;
	canUseCapture: boolean;
	canDeleteObjects: boolean;
	enableBalance: boolean;
	enableStats: boolean;

	// Teams
	attacker_has_cook: boolean;
	defender_has_cook: boolean;

	// Fighters
	initialDinozList: DinozToGetFighter[];
	fighters: DetailedFighter[];

	// Place
	place: PlaceEnum;
}
