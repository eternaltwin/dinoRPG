import { ServiceEnum } from '../enums/ServiceEnum.mjs';
import { FightResult } from '../fight/FightResult.mjs';
import { Item } from '../item/ItemList.mjs';

export interface NpcTalk {
	name: string;
	speech: string; //Correspond au <phase id="speech"> du code MT
	playerChoice: string[]; //Correspond au <a id="speech"> du code MT
	flashvars?: string;
	service?: ServiceEnum[];
	fight?: FightResult;
	rewards?: Partial<Record<Item, number>>;
}
