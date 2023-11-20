import { ServiceEnum } from '../enums/ServiceEnum.mjs';

export interface NpcTalk {
	name: string;
	speech: string; //Correspond au <phase id="speech"> du code MT
	playerChoice: string[]; //Correspond au <a id="speech"> du code MT
	flashvars?: string;
	service?: ServiceEnum[];
}
