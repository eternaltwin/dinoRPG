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

/**
 * One `<scenario>` of the archive's dungeons.xml, in generation order — the
 * maze's IScenario item `v` indexes this array. Attributes map 1:1:
 * `obj`/`count` grant an item, `collec` grants a reward, `icon` is the map
 * icon (a chest when omitted, as obj scenarios in the XML), `micon` the popup
 * icon, and the XML body text lives in i18n under `dungeon.<dungeon>.<text>`.
 */
export type DungeonScenario = {
	obj?: Item;
	count?: number;
	collec?: Reward;
	icon?: 'scroll' | 'chest';
	micon?: string;
	text: string;
};

export type DungeonDetails = {
	skin: DungeonType;
	name: Dungeon;
	placeStart: PlaceEnum;
	placeEnd: PlaceEnum;
	monsters: Monster[];
	condition: Condition;
	scenarios: DungeonScenario[];
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
		// dungeons.xml <d id="katak"> <stage skin="sewer"> scenarios, in order.
		scenarios: [
			{ icon: 'scroll', micon: 'misc', text: 'misc' },
			{ obj: Item.GOLDEN_NAPODINO, text: 'napo' },
			{ obj: Item.POTION_IRMA, count: 3, text: 'potion' },
			{ collec: Reward.DEMON, icon: 'scroll', micon: 'misc', text: 'demon' }
		]
	}
};
