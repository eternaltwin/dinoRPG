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
import { Npc, NpcName } from './npc.mjs';

export const npcList: Partial<Record<NpcName, Npc>> = {
	// [NpcName.street_shouter]: {
	// 	name: NpcName.street_shouter,
	// 	id: 1,
	//	placeId: PlaceEnum.DINOVILLE,
	// 	condition: NpcTrigger.ALWAYS,
	// 	data: PROFESSOR,
	// },
	// [NpcName.michel]: {
	// 	name: NpcName.michel,
	// 	id: 2,
	//	placeId: PlaceEnum.DINOVILLE,
	// 	condition: NpcTrigger.ALWAYS,
	// 	data: PROFESSOR
	// },
	[NpcName.professor]: {
		name: NpcName.professor,
		id: 3,
		placeId: PlaceEnum.UNIVERSITE,
		data: PROFESSOR,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.sofia]: {
		name: NpcName.sofia,
		id: 4,
		placeId: PlaceEnum.VILLA,
		data: SOFIA,
		flashvars: 'frame=plage&background=2',
		condition: undefined,
		missions: undefined
	},
	[NpcName.mmex]: {
		name: NpcName.mmex,
		id: 5,
		placeId: PlaceEnum.FORCEBRUT,
		data: MMEX,
		condition: {
			[ConditionEnum.ACTIVE]: false
		},
		missions: M_MMEX,
		flashvars: undefined
	},
	[NpcName.mineur]: {
		name: NpcName.mineur,
		id: 6,
		placeId: PlaceEnum.MINES_DE_CORAIL,
		data: MINEUR,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.papy]: {
		name: NpcName.papy,
		id: 7,
		placeId: PlaceEnum.PAPY_JOE,
		missions: M_PAPY_JOE,
		data: PAPYJOE,
		condition: undefined,
		flashvars: undefined
	},
	[NpcName.forgeron]: {
		name: NpcName.forgeron,
		id: 8,
		placeId: PlaceEnum.FORGES_DU_GTC,
		condition: { [ConditionEnum.ACTIVE]: false }, //TODO use fmedal as condition
		data: FORGERON,
		flashvars: 'frame=blabla',
		missions: undefined
	},
	[NpcName.bob]: {
		name: NpcName.bob,
		id: 9,
		placeId: PlaceEnum.BAO_BOB,
		missions: M_BAO_BOB,
		data: BAOBOB,
		condition: undefined,
		flashvars: undefined
	},
	[NpcName.baofan]: {
		name: NpcName.baofan,
		id: 10,
		placeId: PlaceEnum.BAO_BOB,
		data: BAOFAN,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.dian]: {
		name: NpcName.dian,
		id: 11,
		placeId: PlaceEnum.CAMP_KORGON,
		data: DIANKORGSEY,
		missions: M_DIANKORGSEY,
		condition: undefined,
		flashvars: undefined
	},
	[NpcName.merguez]: {
		name: NpcName.merguez,
		id: 12,
		placeId: PlaceEnum.RUINES_ASHPOUK,
		data: MERGUEZ,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.shaman]: {
		name: NpcName.shaman,
		id: 13,
		placeId: PlaceEnum.FOSSELAVE,
		data: SHAMAN,
		missions: M_SHAMAN_MOU,
		condition: undefined,
		flashvars: undefined
	},
	[NpcName.gardien]: {
		name: NpcName.gardien,
		id: 14,
		placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
		data: GARDIEN,
		missions: M_GARDIEN,
		condition: undefined,
		flashvars: undefined
	},
	[NpcName.fou]: {
		name: NpcName.fou,
		id: 15,
		placeId: PlaceEnum.COLLINES_HANTEES,
		data: FOU,
		condition: { [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.LANTERN } },
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.garde_atlante]: {
		name: NpcName.garde_atlante,
		id: 16,
		placeId: PlaceEnum.CHUTES_MUTANTES,
		data: GARDE_ATLANTE,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.joveboze]: {
		name: NpcName.joveboze,
		id: 17,
		placeId: PlaceEnum.PORT_DE_PRECHE,
		condition: {
			[Operator.OR]: [
				// Rasca quest
				{ [ConditionEnum.STATUS]: DinozStatusId.JVBZ },
				// Sticky swamp quest
				{
					[Operator.AND]: [
						{ [ConditionEnum.STATUS]: DinozStatusId.WEIRD_SWAMP_SEEN },
						{ [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE },
						{ [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SWAMP_MONSTERS_KNOWN } }
					]
				}
			]
		},
		data: JOVEBOZE_RASCA,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.archis]: {
		name: NpcName.archis,
		id: 18,
		placeId: PlaceEnum.DOME_SOULAFLOTTE,
		condition: { [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.ZORS_GLOVE } },
		data: ARCHISAGE,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.hydargol]: {
		name: NpcName.hydargol,
		id: 19,
		placeId: PlaceEnum.CHUTES_MUTANTES,
		data: HYDARGOL,
		condition: undefined,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.padamoine]: {
		name: NpcName.padamoine,
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
	[NpcName.hulot]: {
		name: NpcName.hulot,
		id: 21,
		placeId: PlaceEnum.AUREE_DE_LA_FORET,
		data: HULOT,
		missions: M_HULOT,
		condition: undefined,
		flashvars: undefined
	},
	[NpcName.rodeur]: {
		name: NpcName.rodeur,
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
	[NpcName.spelele]: {
		name: NpcName.spelele,
		id: 23,
		placeId: PlaceEnum.GORGES_PROFONDES,
		data: SPELELE,
		missions: undefined,
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.FSPELE }
		},
		flashvars: undefined
	},
	[NpcName.pteroz]: {
		name: NpcName.pteroz,
		id: 24,
		placeId: PlaceEnum.PENTES_DE_BASALTE,
		data: PTEROZ,
		missions: undefined,
		condition: {
			[Operator.AND]: [{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.PTEROZ } }, { [ConditionEnum.MINLEVEL]: 8 }]
		},
		flashvars: undefined
	},
	[NpcName.hippo]: {
		name: NpcName.hippo,
		id: 25,
		placeId: PlaceEnum.ILE_WAIKIKI,
		data: HIPPO,
		missions: undefined,
		condition: {
			[Operator.AND]: [{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.HIPPO } }, { [ConditionEnum.MINLEVEL]: 8 }]
		},
		flashvars: undefined
	},
	[NpcName.rocky]: {
		name: NpcName.rocky,
		id: 26,
		placeId: PlaceEnum.FORCEBRUT,
		data: ROCKY,
		missions: undefined,
		condition: {
			[Operator.AND]: [{ [Operator.NOT]: { [ConditionEnum.COLLEC]: Reward.ROCKY } }, { [ConditionEnum.MINLEVEL]: 13 }]
		},
		flashvars: undefined
	},
	[NpcName.vener]: {
		name: NpcName.vener,
		id: 27,
		placeId: PlaceEnum.REPAIRE_DU_VENERABLE,
		data: VENERABLE,
		missions: undefined,
		flashvars: undefined
	},
	[NpcName.baobabe]: {
		name: NpcName.baobabe,
		id: 28,
		placeId: PlaceEnum.REPAIRE_DU_VENERABLE,
		condition: {
			[ConditionEnum.ACTIVE]: false
		},
		data: BAOBABE,
		display: 'baobabe'
	},
	[NpcName.alien]: {
		name: NpcName.alien,
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
	[NpcName.skully]: {
		name: NpcName.skully,
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
	[NpcName.mouldeur]: {
		name: NpcName.mouldeur,
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
	[NpcName.fb_tournament]: {
		name: NpcName.fb_tournament,
		id: 32,
		placeId: PlaceEnum.FORCEBRUT,
		data: FB_TOURNAMENT,
		condition: { [Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.TOURNA } },
		display: 'tournament',
		missions: undefined,
		flashvars: undefined
	}
};
