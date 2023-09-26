import { placeList, statusList } from './index.js';
import {
	ALPHA,
	BAOBOB,
	BAOFAN,
	DIANKORGSEY,
	FORGERON,
	FOU,
	GARDE_ATLANTE,
	GARDIEN,
	JOVEBOZE_RASCA,
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
import { ConditionEnum } from '@drpg/core/models/enums/Parser';

export const npcList: Record<string, Npc> = {
	ALPHA: {
		name: 'alpha_test',
		id: 0,
		placeId: placeList.DINOVILLE.placeId,
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
		data: PROFESSOR
	},
	SOFIA: {
		name: 'sofia',
		id: 4,
		placeId: placeList.VILLA.placeId,
		data: SOFIA,
		flashvars: 'frame=plage&background=2'
	},
	MMEX: {
		name: 'mmex',
		id: 5,
		placeId: placeList.FORCEBRUT.placeId,
		data: MMEX
	},
	MINEUR: {
		name: 'mineur',
		id: 6,
		placeId: placeList.MINES_DE_CORAIL.placeId,
		data: MINEUR
	},
	PAPY: {
		name: 'papy',
		id: 7,
		placeId: placeList.PAPY_JOE.placeId,
		missions: M_PAPY_JOE,
		data: PAPYJOE
	},
	FORGERON: {
		name: 'forgeron',
		id: 8,
		placeId: placeList.FORGES_DU_GTC.placeId,
		// condition: set to epic(medaillon à trois yeux) later
		data: FORGERON,
		flashvars: 'frame=blabla'
	},
	BOB: {
		name: 'bob',
		id: 9,
		placeId: placeList.BAO_BOB.placeId,
		missions: M_BAO_BOB,
		data: BAOBOB
	},
	BAOFAN: {
		name: 'baofan',
		id: 10,
		placeId: placeList.BAO_BOB.placeId,
		data: BAOFAN
	},
	DIAN_KORGSEY: {
		name: 'dian',
		id: 11,
		placeId: placeList.CAMP_KORGON.placeId,
		data: DIANKORGSEY,
		missions: M_DIANKORGSEY
	},
	MERGUEZ: {
		name: 'merguez',
		id: 12,
		placeId: placeList.RUINES_ASHPOUK.placeId,
		data: MERGUEZ
	},
	SHAMAN: {
		name: 'shaman',
		id: 13,
		placeId: placeList.FOSSELAVE.placeId,
		data: SHAMAN,
		missions: M_SHAMAN_MOU
	},
	GARDIEN: {
		name: 'gardien',
		id: 14,
		placeId: placeList.PORTE_DE_SYLVENOIRE.placeId,
		data: GARDIEN,
		missions: M_GARDIEN
	},
	FOU: {
		name: 'fou',
		id: 15,
		placeId: placeList.COLLINES_HANTEES.placeId,
		data: FOU
	},
	GARDE_ATLANTE: {
		name: 'garde_atlante',
		id: 16,
		placeId: placeList.CHUTES_MUTANTES.placeId,
		data: GARDE_ATLANTE
	},
	JOVE_BOZE_RASCA: {
		name: 'joveboze',
		id: 17,
		placeId: placeList.PORT_DE_PRECHE.placeId,
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.JVBZ
		},
		data: JOVEBOZE_RASCA
	}
};
