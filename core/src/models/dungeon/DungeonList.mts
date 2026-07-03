import { DungeonType } from '@drpg/prisma/enums';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { Monster } from '../fight/MonsterList.mjs';
import { Condition } from '../npc/NpcConditions.mjs';
import { ConditionEnum } from '../enums/Parser.mjs';
import { Item } from '../item/ItemList.mjs';
import { Reward } from '../reward/RewardList.mjs';

export enum Dungeon {
	KATATOMBS = 'katatombs'
}

export type DungeonItem =
	| {
			type: 'item';
			itemId: Item;
			quantity: number;
			text: string;
	  }
	| {
			type: 'reward';
			rewardId: Reward;
			text: string;
	  }
	| {
			type: 'fake';
			icon: string;
			text: string;
	  };

export type DungeonDetails = {
	skin: DungeonType;
	name: Dungeon;
	placeStart: PlaceEnum;
	placeEnd: PlaceEnum;
	monsters: Monster[];
	condition: Condition;
	items: DungeonItem[];
};

export const DungeonList: Readonly<Record<Dungeon, DungeonDetails>> = {
	[Dungeon.KATATOMBS]: {
		name: Dungeon.KATATOMBS,
		skin: DungeonType.sewer,
		placeStart: PlaceEnum.CIMETIERE,
		placeEnd: PlaceEnum.CIMETIERE,
		monsters: [
			Monster.GOUPIGNON,
			Monster.GOUPIGNON2,
			Monster.GOUPIGNON3,
			Monster.WOLF,
			Monster.GLUON,
			Monster.GREEN_GIANT,
			Monster.COQDUR,
			Monster.PIRHANOS
		],
		condition: {
			[ConditionEnum.ACTIVE]: true
		},
		items: [
			{
				type: 'fake',
				icon: 'scroll',
				text: 'misc'
			},
			{
				type: 'item',
				itemId: Item.GOLDEN_NAPODINO,
				quantity: 1,
				text: 'napo'
			},
			{
				type: 'item',
				itemId: Item.POTION_IRMA,
				quantity: 3,
				text: 'potion'
			},
			{
				type: 'reward',
				rewardId: Reward.DEMON,
				text: 'demon'
			}
		]
	}
};
