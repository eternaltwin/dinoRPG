import { Npc, NpcTrigger } from '../models/index.js';
import { placeList } from './index.js';
import { ALPHA, MINEUR, MMEX, PROFESSOR, SOFIA } from './characters/index.js';

export const npcList: Record<string, Npc> = {
	ALPHA: {
		name: 'alpha_test',
		id: 0,
		placeId: placeList.DINOVILLE.placeId,
		condition: NpcTrigger.ALWAYS,
		data: ALPHA
	},
	// CRIEUR: {
	// 	name: 'street_shouter',
	// 	id: 1,
	// 	placeId: placeList.DINOVILLE.placeId,
	// 	condition: NpcTrigger.ALWAYS,
	// 	data: PROFESSOR
	// },
	// MICHEL: {
	// 	name: 'michel',
	// 	id: 2,
	// 	placeId: placeList.DINOVILLE.placeId,
	// 	condition: NpcTrigger.ALWAYS,
	// 	data: PROFESSOR
	// },
	PROFESSOR: {
		name: 'professor',
		id: 3,
		placeId: placeList.UNIVERSITE.placeId,
		condition: NpcTrigger.ALWAYS,
		data: PROFESSOR
	},
	SOFIA: {
		name: 'sofia',
		id: 4,
		placeId: placeList.VILLA.placeId,
		condition: NpcTrigger.ALWAYS,
		data: SOFIA,
		flashvars: 'frame=plage&background=2'
	},
	MMEX: {
		name: 'mmex',
		id: 5,
		placeId: placeList.FORCEBRUT.placeId,
		condition: NpcTrigger.ALWAYS,
		data: MMEX
	},
	MINEUR: {
		name: 'mineur',
		id: 6,
		placeId: placeList.MINES_DE_CORAIL.placeId,
		condition: NpcTrigger.ALWAYS,
		data: MINEUR
	}
};
