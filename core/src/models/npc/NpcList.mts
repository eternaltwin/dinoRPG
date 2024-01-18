import { ConditionEnum, Operator } from '../enums/Parser.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { itemList } from '../item/ItemList.mjs';
import { MissionID } from '../missions/missionList.mjs';
import { ALPHA } from './characters/alpha.mjs';
import { ARCHISAGE } from './characters/archisage.mjs';
import { BAOBOB } from './characters/baoBob.mjs';
import { BAOFAN } from './characters/baofan.mjs';
import { DIANKORGSEY } from './characters/dianKorgsey.mjs';
import { FORGERON } from './characters/forgeron.mjs';
import { FOU } from './characters/fou.mjs';
import { GARDE_ATLANTE } from './characters/gardeAtlante.mjs';
import { GARDIEN } from './characters/gardien.mjs';
import { HULOT } from './characters/hulot.mjs';
import { HYDARGOL } from './characters/hydargol.mjs';
import { JOVEBOZE_RASCA } from './characters/joveboze.mjs';
import { MERGUEZ } from './characters/merguez.mjs';
import { MINEUR } from './characters/mineur.mjs';
import { MMEX } from './characters/mmex.mjs';
import { PADAMOINE } from './characters/padamoine.mjs';
import { PAPYJOE } from './characters/papyJoe.mjs';
import { PROFESSOR } from './characters/prof.mjs';
import { RODEUR, RODEUR2, RODEUR3 } from './characters/rodeur.mjs';
import { SHAMAN } from './characters/shaman.mjs';
import { SOFIA } from './characters/sofia.mjs';
import { M_BAO_BOB } from './missions/baoBob.mjs';
import { M_DIANKORGSEY } from './missions/dianKorgsey.mjs';
import { M_GARDIEN } from './missions/gardien.mjs';
import { M_HULOT } from './missions/hulot.mjs';
import { M_PAPY_JOE } from './missions/papyJoe.mjs';
import { M_RODEUR } from './missions/rodeur.mjs';
import { M_SHAMAN_MOU } from './missions/shaman.mjs';
import { Npc } from './npc.mjs';
import { M_MMEX } from './missions/mmex.mjs';
import { DinozStatusId } from '../dinoz/StatusList.mjs';

export const npcList: Record<string, Npc> = {
	ALPHA: {
		name: 'alpha_test',
		id: 0,
		placeId: PlaceEnum.DINOVILLE,
		data: ALPHA,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	// CRIEUR: {
	// 	name: 'street_shouter',
	// 	id: 1,
	//	placeId: PlaceEnum.DINOVILLE,
	// 	condition: NpcTrigger.ALWAYS,
	// 	data: PROFESSOR,
	// },
	// MICHEL: {
	// 	name: 'michel',
	// 	id: 2,
	//	placeId: PlaceEnum.DINOVILLE,
	// 	condition: NpcTrigger.ALWAYS,
	// 	data: PROFESSOR
	// },
	PROFESSOR: {
		name: 'professor',
		id: 3,
		placeId: PlaceEnum.UNIVERSITE,
		data: PROFESSOR,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	SOFIA: {
		name: 'sofia',
		id: 4,
		placeId: PlaceEnum.VILLA,
		data: SOFIA,
		flashvars: 'frame=plage&background=2',
		condition: undefined,
		missions: undefined
	},
	MMEX: {
		name: 'mmex',
		id: 5,
		placeId: PlaceEnum.FORCEBRUT,
		data: MMEX,
		condition: undefined,
		missions: M_MMEX,
		flashvars: undefined
	},
	MINEUR: {
		name: 'mineur',
		id: 6,
		placeId: PlaceEnum.MINES_DE_CORAIL,
		data: MINEUR,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	PAPY: {
		name: 'papy',
		id: 7,
		placeId: PlaceEnum.PAPY_JOE,
		missions: M_PAPY_JOE,
		data: PAPYJOE,
		condition: undefined,
		flashvars: undefined
	},
	FORGERON: {
		name: 'forgeron',
		id: 8,
		placeId: PlaceEnum.FORGES_DU_GTC,
		// condition: set to epic(medaillon à trois yeux) later
		data: FORGERON,
		flashvars: 'frame=blabla',
		condition: undefined,
		missions: undefined
	},
	BOB: {
		name: 'bob',
		id: 9,
		placeId: PlaceEnum.BAO_BOB,
		missions: M_BAO_BOB,
		data: BAOBOB,
		condition: undefined,
		flashvars: undefined
	},
	BAOFAN: {
		name: 'baofan',
		id: 10,
		placeId: PlaceEnum.BAO_BOB,
		data: BAOFAN,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	DIAN_KORGSEY: {
		name: 'dian',
		id: 11,
		placeId: PlaceEnum.CAMP_KORGON,
		data: DIANKORGSEY,
		missions: M_DIANKORGSEY,
		condition: undefined,
		flashvars: undefined
	},
	MERGUEZ: {
		name: 'merguez',
		id: 12,
		placeId: PlaceEnum.RUINES_ASHPOUK,
		data: MERGUEZ,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	SHAMAN: {
		name: 'shaman',
		id: 13,
		placeId: PlaceEnum.FOSSELAVE,
		data: SHAMAN,
		missions: M_SHAMAN_MOU,
		condition: undefined,
		flashvars: undefined
	},
	GARDIEN: {
		name: 'gardien',
		id: 14,
		placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
		data: GARDIEN,
		missions: M_GARDIEN,
		condition: undefined,
		flashvars: undefined
	},
	FOU: {
		name: 'fou',
		id: 15,
		placeId: PlaceEnum.COLLINES_HANTEES,
		data: FOU,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	GARDE_ATLANTE: {
		name: 'garde_atlante',
		id: 16,
		placeId: PlaceEnum.CHUTES_MUTANTES,
		data: GARDE_ATLANTE,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	JOVE_BOZE_RASCA: {
		name: 'joveboze',
		id: 17,
		placeId: PlaceEnum.PORT_DE_PRECHE,
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.JVBZ
		},
		data: JOVEBOZE_RASCA,
		missions: undefined,
		flashvars: undefined
	},
	ARCHISAGE: {
		name: 'archis',
		id: 18,
		placeId: PlaceEnum.DOME_SOULAFLOTTE,
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE }
		},
		data: ARCHISAGE,
		missions: undefined,
		flashvars: undefined
	},
	HYDARGOL: {
		name: 'hydargol',
		id: 19,
		placeId: PlaceEnum.CHUTES_MUTANTES,
		data: HYDARGOL,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	PADAMOINE: {
		name: 'padamoine',
		id: 20,
		placeId: PlaceEnum.PORT_DE_PRECHE,
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.ZENBRO
		},
		data: PADAMOINE,
		missions: undefined,
		flashvars: undefined
	},
	HULOT: {
		name: 'hulot',
		id: 21,
		placeId: PlaceEnum.AUREE_DE_LA_FORET,
		data: HULOT,
		missions: M_HULOT,
		condition: undefined,
		flashvars: undefined
	},
	RODEUR: {
		name: 'rodeur',
		id: 22,
		placeId: PlaceEnum.FORGES_DU_GTC,
		data: RODEUR,
		missions: M_RODEUR,
		condition: {
			[Operator.AND]: [
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODRIZ } },
				{ [ConditionEnum.MINLEVEL]: 15 }
			]
		},
		flashvars: undefined
	},
	RODEUR2: {
		name: 'rodeur2',
		id: 23,
		placeId: PlaceEnum.FORGES_DU_GTC,
		data: RODEUR2,
		missions: M_RODEUR,
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODRIZ },
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODLIF } },
				{ [ConditionEnum.MINLEVEL]: 20 }
			]
		},
		flashvars: undefined
	},
	RODEUR3: {
		name: 'rodeur3',
		id: 24,
		placeId: PlaceEnum.FORGES_DU_GTC,
		data: RODEUR3,
		missions: undefined,
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODLIF },
				{ [Operator.NOT]: { [ConditionEnum.POSSESS_OBJECT]: itemList.TIK_BRACELET.itemId } }
			]
		},
		flashvars: undefined
	}
};
