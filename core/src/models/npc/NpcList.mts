import { statusList } from "../dinoz/StatusList.mjs";
import { ConditionEnum } from "../enums/Parser.mjs";
import { placeList } from "../place/PlaceList.mjs";
import { ALPHA } from "./characters/alpha.mjs";
import { ARCHISAGE } from "./characters/archisage.mjs";
import { BAOBOB } from "./characters/baoBob.mjs";
import { BAOFAN } from "./characters/baofan.mjs";
import { DIANKORGSEY } from "./characters/dianKorgsey.mjs";
import { FORGERON } from "./characters/forgeron.mjs";
import { FOU } from "./characters/fou.mjs";
import { GARDE_ATLANTE } from "./characters/gardeAtlante.mjs";
import { GARDIEN } from "./characters/gardien.mjs";
import { HULOT } from "./characters/hulot.mjs";
import { HYDARGOL } from "./characters/hydargol.mjs";
import { JOVEBOZE_RASCA } from "./characters/joveboze.mjs";
import { MERGUEZ } from "./characters/merguez.mjs";
import { MINEUR } from "./characters/mineur.mjs";
import { MMEX } from "./characters/mmex.mjs";
import { PADAMOINE } from "./characters/padamoine.mjs";
import { PAPYJOE } from "./characters/papyJoe.mjs";
import { PROFESSOR } from "./characters/prof.mjs";
import { SHAMAN } from "./characters/shaman.mjs";
import { SOFIA } from "./characters/sofia.mjs";
import { M_BAO_BOB } from "./missions/baoBob.mjs";
import { M_DIANKORGSEY } from "./missions/dianKorgsey.mjs";
import { M_GARDIEN } from "./missions/gardien.mjs";
import { M_HULOT } from "./missions/hulot.mjs";
import { M_PAPY_JOE } from "./missions/papyJoe.mjs";
import { M_SHAMAN_MOU } from "./missions/shaman.mjs";

export const npcList = {
	ALPHA: {
		name: 'alpha_test',
		id: 0,
		placeId: placeList.DINOVILLE.placeId,
		data: ALPHA,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	// CRIEUR: {
	// 	name: 'street_shouter',
	// 	id: 1,
	// 	placeId: placeList.DINOVILLE.placeId,
	// 	condition: NpcTrigger.ALWAYS,
	// 	data: PROFESSOR,
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
		data: PROFESSOR,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	SOFIA: {
		name: 'sofia',
		id: 4,
		placeId: placeList.VILLA.placeId,
		data: SOFIA,
		flashvars: 'frame=plage&background=2',
		condition: undefined,
		missions: undefined,
	},
	MMEX: {
		name: 'mmex',
		id: 5,
		placeId: placeList.FORCEBRUT.placeId,
		data: MMEX,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	MINEUR: {
		name: 'mineur',
		id: 6,
		placeId: placeList.MINES_DE_CORAIL.placeId,
		data: MINEUR,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	PAPY: {
		name: 'papy',
		id: 7,
		placeId: placeList.PAPY_JOE.placeId,
		missions: M_PAPY_JOE,
		data: PAPYJOE,
		condition: undefined,
		flashvars: undefined,
	},
	FORGERON: {
		name: 'forgeron',
		id: 8,
		placeId: placeList.FORGES_DU_GTC.placeId,
		// condition: set to epic(medaillon à trois yeux) later
		data: FORGERON,
		flashvars: 'frame=blabla',
		condition: undefined,
		missions: undefined,
	},
	BOB: {
		name: 'bob',
		id: 9,
		placeId: placeList.BAO_BOB.placeId,
		missions: M_BAO_BOB,
		data: BAOBOB,
		condition: undefined,
		flashvars: undefined,
	},
	BAOFAN: {
		name: 'baofan',
		id: 10,
		placeId: placeList.BAO_BOB.placeId,
		data: BAOFAN,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	DIAN_KORGSEY: {
		name: 'dian',
		id: 11,
		placeId: placeList.CAMP_KORGON.placeId,
		data: DIANKORGSEY,
		missions: M_DIANKORGSEY,
		condition: undefined,
		flashvars: undefined,
	},
	MERGUEZ: {
		name: 'merguez',
		id: 12,
		placeId: placeList.RUINES_ASHPOUK.placeId,
		data: MERGUEZ,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	SHAMAN: {
		name: 'shaman',
		id: 13,
		placeId: placeList.FOSSELAVE.placeId,
		data: SHAMAN,
		missions: M_SHAMAN_MOU,
		condition: undefined,
		flashvars: undefined,
	},
	GARDIEN: {
		name: 'gardien',
		id: 14,
		placeId: placeList.PORTE_DE_SYLVENOIRE.placeId,
		data: GARDIEN,
		missions: M_GARDIEN,
		condition: undefined,
		flashvars: undefined,
	},
	FOU: {
		name: 'fou',
		id: 15,
		placeId: placeList.COLLINES_HANTEES.placeId,
		data: FOU,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	GARDE_ATLANTE: {
		name: 'garde_atlante',
		id: 16,
		placeId: placeList.CHUTES_MUTANTES.placeId,
		data: GARDE_ATLANTE,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	JOVE_BOZE_RASCA: {
		name: 'joveboze',
		id: 17,
		placeId: placeList.PORT_DE_PRECHE.placeId,
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.JVBZ
		},
		data: JOVEBOZE_RASCA,
		missions: undefined,
		flashvars: undefined,
	},
	ARCHISAGE: {
		name: 'archis',
		id: 18,
		placeId: placeList.DOME_SOULAFLOTTE.placeId,
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.ZORS_GLOVE,
			reverse: true
		},
		data: ARCHISAGE,
		missions: undefined,
		flashvars: undefined,
	},
	HYDARGOL: {
		name: 'hydargol',
		id: 19,
		placeId: placeList.CHUTES_MUTANTES.placeId,
		data: HYDARGOL,
		condition: undefined,
		missions: undefined,
		flashvars: undefined,
	},
	PADAMOINE: {
		name: 'padamoine',
		id: 20,
		placeId: placeList.PORT_DE_PRECHE.placeId,
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.ZENBRO
		},
		data: PADAMOINE,
		missions: undefined,
		flashvars: undefined,
	},
	HULOT: {
		name: 'hulot',
		id: 21,
		placeId: placeList.AUREE_DE_LA_FORET.placeId,
		data: HULOT,
		missions: M_HULOT,
		condition: undefined,
		flashvars: undefined,
	}
} as const;
