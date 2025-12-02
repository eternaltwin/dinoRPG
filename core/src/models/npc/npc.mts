import { NpcData } from './NpcData.mjs';
import { Mission } from '../missions/mission.mjs';
import { Condition } from './NpcConditions.mjs';

export enum NpcName {
	street_shouter = 'street_shouter',
	michel = 'michel',
	professor = 'professor',
	sofia = 'sofia',
	mmex = 'mmex',
	mineur = 'mineur',
	papy = 'papy',
	forgeron = 'forgeron',
	bob = 'bob',
	baofan = 'baofan',
	dian = 'dian',
	merguez = 'merguez',
	shaman = 'shaman',
	gardien = 'gardien',
	fou = 'fou',
	garde_atlante = 'garde_atlante',
	joveboze = 'joveboze',
	archis = 'archis',
	hydargol = 'hydargol',
	padamoine = 'padamoine',
	hulot = 'hulot',
	rodeur = 'rodeur',
	spelele = 'spelele',
	pteroz = 'pteroz',
	hippo = 'hippo',
	rocky = 'rocky',
	vener = 'vener',
	baobabe = 'baobabe',
	alien = 'alien',
	skully = 'skully',
	mouldeur = 'mouldeur',
	fb_tournament = 'fb_tournament'
}

export interface Npc {
	name: NpcName;
	id: number;
	placeId: number;
	condition?: Condition;
	data: Readonly<Record<string, NpcData>>;
	missions?: Mission[];
	display?: string;
	flashvars?: string;
}
