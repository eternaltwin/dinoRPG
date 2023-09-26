import { Rewarder } from '../reward/Rewarder.mjs';
import { Condition } from './NpcConditions.mjs';
import { NpcAction } from './NpcAction.mjs';

export interface NpcData {
	stepName: string; //Correspond au <phase id="speech"> du code MT
	alias?: string;
	nextStep: Array<string>; //Correspond au <a id="speech"> du code MT
	initialStep?: boolean;
	condition?: Condition;
	action?: NpcAction;
	reward?: Array<Rewarder>;
	target?: string;
}
