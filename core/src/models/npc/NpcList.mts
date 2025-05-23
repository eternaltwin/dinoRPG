import { DinozStatusId } from '../dinoz/StatusList.mjs';
import { Comparator, ConditionEnum, Operator } from '../enums/Parser.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { Scenario } from '../enums/Scenario.mjs';
import { MissionID } from '../missions/missionList.mjs';
import { Reward } from '../reward/RewardList.mjs';
import { ALIEN } from './characters/alien.mjs';
import { ARCHISAGE } from './characters/archisage.mjs';
import { BAOBABE } from './characters/baoBabe.mjs';
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
import { RODEUR } from './characters/rodeur.mjs';
import { SHAMAN } from './characters/shaman.mjs';
import { MOULDEUR, SKULLY } from './characters/skully.mjs';
import { SOFIA } from './characters/sofia.mjs';
import { SPELELE } from './characters/spelele.mjs';
import { HIPPO, PTEROZ, ROCKY } from './characters/totems.mjs';
import { FB_TOURNAMENT } from './characters/tournois.mjs';
import { VENERABLE } from './characters/vener.mjs';
import { M_BAO_BOB } from './missions/baoBob.mjs';
import { M_DIANKORGSEY } from './missions/dianKorgsey.mjs';
import { M_GARDIEN } from './missions/gardien.mjs';
import { M_HULOT } from './missions/hulot.mjs';
import { M_MMEX } from './missions/mmex.mjs';
import { M_PAPY_JOE } from './missions/papyJoe.mjs';
import { M_RODEUR } from './missions/rodeur.mjs';
import { M_SHAMAN_MOU } from './missions/shaman.mjs';
import { M_SKULLY } from './missions/skully.mjs';
import { Npc } from './npc.mjs';

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
		condition: {
			[ConditionEnum.ACTIVE]: false
		},
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
		condition: { [ConditionEnum.ACTIVE]: false }, //TODO use fmedal as condition
		data: FORGERON,
		flashvars: 'frame=blabla',
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
		condition: {
			[Operator.OR]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.LANTERN } },
				{
					[ConditionEnum.STATUS]: DinozStatusId.FRETURN
				}
			]
		},
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
			[Operator.OR]: [
				{
					[Operator.AND]: [
						{ [ConditionEnum.STATUS]: DinozStatusId.RASCAPHANDRE_DECOY },
						{
							[ConditionEnum.STATUS]: DinozStatusId.FRETURN
						}
					]
				},
				{ [ConditionEnum.STATUS]: DinozStatusId.JVBZ }
			]
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
			[Operator.OR]: [
				{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE } },
				{
					[ConditionEnum.STATUS]: DinozStatusId.FRETURN
				}
			]
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
			[Operator.AND]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.ZENBRO },
				{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.PERLE } }
			]
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
			[Operator.OR]: [
				{
					[Operator.AND]: [
						{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODRIZ } },
						{ [ConditionEnum.MINLEVEL]: 15 }
					]
				},
				{
					[Operator.AND]: [
						{ [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODRIZ },
						{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODLIF } },
						{ [ConditionEnum.MINLEVEL]: 20 }
					]
				},
				{
					[Operator.AND]: [
						{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.TIK } },
						{ [ConditionEnum.FINISHED_MISSION]: MissionID.RODEUR_RODLIF }
					]
				}
			]
		},
		flashvars: undefined
	},
	SPELELE: {
		name: 'spelele',
		id: 23,
		placeId: PlaceEnum.GORGES_PROFONDES,
		data: SPELELE,
		missions: undefined,
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.FSPELE }
		},
		flashvars: undefined
	},
	PTEROZ: {
		name: 'pteroz',
		id: 24,
		placeId: PlaceEnum.PENTES_DE_BASALTE,
		data: PTEROZ,
		missions: undefined,
		condition: {
			[Operator.OR]: [
				{
					[Operator.AND]: [
						{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.PTEROZ } },
						{ [ConditionEnum.MINLEVEL]: 8 }
					]
				},
				{
					[ConditionEnum.STATUS]: DinozStatusId.FRETURN
				}
			]
		},
		flashvars: undefined
	},
	HIPPO: {
		name: 'hippo',
		id: 25,
		placeId: PlaceEnum.ILE_WAIKIKI,
		data: HIPPO,
		missions: undefined,
		condition: {
			[Operator.OR]: [
				{
					[Operator.AND]: [
						{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.HIPPO } },
						{ [ConditionEnum.MINLEVEL]: 8 }
					]
				},
				{
					[ConditionEnum.STATUS]: DinozStatusId.FRETURN
				}
			]
		},
		flashvars: undefined
	},
	ROCKY: {
		name: 'rocky',
		id: 26,
		placeId: PlaceEnum.FORCEBRUT,
		data: ROCKY,
		missions: undefined,
		condition: {
			[Operator.OR]: [
				{
					[Operator.AND]: [
						{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.ROCKY } },
						{ [ConditionEnum.MINLEVEL]: 13 }
					]
				},
				{
					[ConditionEnum.STATUS]: DinozStatusId.FRETURN
				}
			]
		},
		flashvars: undefined
	},
	VENERABLE: {
		name: 'vener',
		id: 27,
		placeId: PlaceEnum.REPAIRE_DU_VENERABLE,
		data: VENERABLE,
		missions: undefined,
		flashvars: undefined
	},
	MLEBAO: {
		name: 'baobabe',
		id: 28,
		placeId: PlaceEnum.REPAIRE_DU_VENERABLE,
		condition: {
			[ConditionEnum.ACTIVE]: false
		},
		data: BAOBABE,
		display: 'baobabe'
	},
	ALIEN: {
		name: 'alien',
		display: 'alien',
		id: 29,
		placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
		data: ALIEN,
		condition: {
			[Operator.AND]: [
				{
					[Operator.OR]: [
						// First appearance of the alien with a time condition
						{ [Operator.AND]: [{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 0, '='] }, { [ConditionEnum.TIME]: 30 }] },
						{
							[Operator.OR]: [
								// Normal appearance when the player is between step 1 and 8 of the scenario
								{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 1, '='] },
								{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 1, '+'] }
							]
						}
					]
				},
				{
					// Disappearance of the alien when the player has completed the scenario and obtained the feather
					[Operator.NOT]: {
						[Operator.AND]: [
							{ [ConditionEnum.SCENARIO]: [Scenario.STAR, 9, '='] },
							{ [ConditionEnum.COLLEC]: Reward.PLUME }
						]
					}
				}
			]
		},
		missions: undefined,
		flashvars: undefined
	},
	SKULLY: {
		name: 'skully',
		id: 30,
		placeId: PlaceEnum.CIMETIERE,
		data: SKULLY,
		condition: {
			[Operator.OR]: [
				{ [ConditionEnum.STATUS]: DinozStatusId.SKULLY_MEMORY },
				{ [ConditionEnum.DINOZ_LIFE]: [Comparator.LESSER_EQUAL, 10] }
			]
		},
		display: 'skully',
		missions: M_SKULLY,
		flashvars: undefined
	},
	MOULDEUR: {
		name: 'mouldeur',
		id: 31,
		placeId: PlaceEnum.RUINES_ASHPOUK,
		data: MOULDEUR,
		condition: {
			[Operator.AND]: [{ [ConditionEnum.CURRENT_MISSION]: MissionID.SKULLY_END }, { [ConditionEnum.CURRENT_STEP]: 1 }]
		},
		display: 'moulder',
		missions: undefined,
		flashvars: undefined
	},
	FB_TOURNAMENT: {
		name: 'fb_tournament',
		id: 32,
		placeId: PlaceEnum.FORCEBRUT,
		data: FB_TOURNAMENT,
		condition: { [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.TOURNA } },
		display: 'tournament',
		missions: undefined,
		flashvars: undefined
	}
};
