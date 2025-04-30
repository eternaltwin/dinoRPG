import { Dinoz, DinozCatch, DinozItem, DinozSkill, DinozStatus } from '@drpg/prisma';
import { DetailedFighter } from './DetailedFighter.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { Skill } from '../dinoz/SkillList.mjs';
import { Item } from '../item/ItemList.mjs';

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

export interface TeamFightConfiguration {
	[Skill.ELECTROLYSE]: number;
	[Skill.GARDE_FORESTIER]: number;
	[Skill.CUISINIER]?: boolean;
	[Skill.CHEF_DE_GUERRE]?: boolean;
	[Skill.MAITRE_LEVITATEUR]?: boolean;
	[Item.EMBER]?: boolean;
	[Item.BEER]?: boolean;
}

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
	attackerTeam: TeamFightConfiguration;
	defenderTeam: TeamFightConfiguration;

	// Fighters
	initialDinozList: DinozToGetFighter[];
	fighters: DetailedFighter[];

	// Place
	place: PlaceEnum;
}
