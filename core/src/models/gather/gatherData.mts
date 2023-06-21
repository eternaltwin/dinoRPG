import { Condition } from '../npc/NpcConditions.mjs';
import { GatherItems } from './gatherItems.mjs';
import { GatherType } from '../enums/GatherType.mjs';
import { ItemFiche } from '../item/ItemFiche.mjs';

export type GatherData =
	| {
			action: string;
			special: false;
			type:
				| GatherType.HUNT
				| GatherType.SEEK
				| GatherType.ENERGY1
				| GatherType.ENERGY2
				| GatherType.CUEILLE1
				| GatherType.CUEILLE2
				| GatherType.CUEILLE3
				| GatherType.CUEILLE4
				| GatherType.FISH;
			size: number;
			minimumClick: number;
			condition: Condition; //Skill needed
			apparence: string; //skin
			items: Array<GatherItems>;
	  }
	| {
			action: string;
			special: true;
			type: GatherType.ANNIV | GatherType.LABO | GatherType.PARTY | GatherType.TICTAC | GatherType.XMAS;
			size: number;
			minimumClick: number;
			condition: Condition; //Skill needed
			apparence: string; //skin
			items: Array<GatherItems>;
			cost: ItemFiche;
	  };
