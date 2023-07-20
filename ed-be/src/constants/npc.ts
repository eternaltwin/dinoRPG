import { placeList } from './index.js';
import {
	ALPHA,
	BAOBOB,
	BAOFAN,
	DIANKORGSEY,
	FORGERON,
	GARDIEN,
	MERGUEZ,
	MINEUR,
	MMEX,
	PAPYJOE,
	PROFESSOR,
	SHAMAN,
	SOFIA
} from './characters/index.js';
import { M_BAO_BOB, M_DIANKORGSEY, M_GARDIEN, M_PAPY_JOE, M_SHAMAN_MOU } from './missions/index.js';
import { Npc } from '@drpg/core/models/npc/npc';
import { NpcTrigger } from '@drpg/core/models/enums/NpcTrigger';

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
	},
	PAPY: {
		name: 'papy',
		id: 7,
		placeId: placeList.PAPY_JOE.placeId,
		condition: NpcTrigger.ALWAYS,
		missions: M_PAPY_JOE,
		data: PAPYJOE
	},
	FORGERON: {
		name: 'forgeron',
		id: 8,
		placeId: placeList.FORGES_DU_GTC.placeId,
		condition: NpcTrigger.ALWAYS, // set to epic(medaillon à trois yeux) later
		data: FORGERON,
		flashvars: 'frame=blabla'
	},
	BOB: {
		name: 'bob',
		id: 9,
		placeId: placeList.BAO_BOB.placeId,
		condition: NpcTrigger.ALWAYS,
		missions: M_BAO_BOB,
		data: BAOBOB
	},
	BAOFAN: {
		name: 'baofan',
		id: 10,
		placeId: placeList.BAO_BOB.placeId,
		condition: NpcTrigger.ALWAYS,
		data: BAOFAN
	},
	DIAN_KORGSEY: {
		name: 'dian',
		id: 11,
		placeId: placeList.CAMP_KORGON.placeId,
		condition: NpcTrigger.ALWAYS,
		data: DIANKORGSEY,
		missions: M_DIANKORGSEY
	},
	MERGUEZ: {
		name: 'merguez',
		id: 12,
		placeId: placeList.RUINES_ASHPOUK.placeId,
		condition: NpcTrigger.ALWAYS,
		data: MERGUEZ
	},
	SHAMAN: {
		name: 'shaman',
		id: 13,
		placeId: placeList.FOSSELAVE.placeId,
		condition: NpcTrigger.ALWAYS,
		data: SHAMAN,
		missions: M_SHAMAN_MOU
	},
	GARDIEN: {
		name: 'gardien',
		id: 14,
		placeId: placeList.PORTE_DE_SYLVENOIRE.placeId,
		condition: NpcTrigger.ALWAYS,
		data: GARDIEN,
		missions: M_GARDIEN
	}
};
