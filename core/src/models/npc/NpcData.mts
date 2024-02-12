import { Rewarder } from '../reward/Rewarder.mjs';
import { Condition } from './NpcConditions.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';

export interface NpcData {
	stepName: string; //Correspond au <phase id="speech"> du code MT
	alias?: string;
	nextStep: string[]; //Correspond au <a id="speech"> du code MT
	initialStep?: boolean;
	condition?: Condition;
	fight?: MonsterFiche[];
	reward?: Rewarder[];
	target?: string;
}
