import { ConditionEnum } from '../enums/Parser.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';
import { MapZone } from '../enums/MapZone.mjs';
import { ItemFiche } from '../item/ItemFiche.mjs';
import { DialogText, FightText } from './specialActions.mjs';

export type missionRequirement =
	| {
			actionType: ConditionEnum.KILL;
			target: string[];
			value: number;
			zone: MapZone;
	  }
	| {
			actionType: ConditionEnum.KILL_BOSS;
			target: MonsterFiche[];
	  }
	| {
			actionType: ConditionEnum.TALKTO;
			target: string;
			action?: string;
			npcName?: string;
	  }
	| {
			actionType: ConditionEnum.GIVE_ITEM;
			target: string;
			itemQuantity: number;
			item: ItemFiche;
			action?: string;
			npcName?: string;
	  }
	| {
			actionType: ConditionEnum.LAUNCH_FIGHT;
			mobList: MonsterFiche[];
			target: string;
			startText?: FightText;
			endText?: FightText;
			dialog?: DialogText;
	  }
	| {
			actionType: Exclude<
				ConditionEnum,
				| ConditionEnum.KILL
				| ConditionEnum.KILL_BOSS
				| ConditionEnum.TALKTO
				| ConditionEnum.GIVE_ITEM
				| ConditionEnum.LAUNCH_FIGHT
			>;

			target: string;
	  };
