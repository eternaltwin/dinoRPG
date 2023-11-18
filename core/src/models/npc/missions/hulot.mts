import { statusList } from '../../dinoz/StatusList.mjs';
import { RewardEnum, ConditionEnum, Operator } from '../../enums/Parser.mjs';
import { itemList } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { placeList } from '../../place/PlaceList.mjs';

export const M_HULOT: Array<Mission> = [
	// Missions 44 to 48
	{
		missionId: MissionID.HULOT_SEQACT,
		missionName: 'seqact',
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 1500
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 40
			}
		],
		condition: {
			[Operator.OR]: [
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_TOXIC } },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_HUCURE }
			]
		},
		steps: [
			{
				stepId: 0,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'any',
					value: 6
				},
				displayedAction: 'killAny',
				displayedText: 'killAny'
			},
			{
				stepId: 1,
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'auree'
				},
				displayedAction: 'hulot',
				displayedText: 'hulot'
			}
		]
	},
	{
		missionId: MissionID.HULOT_TOXIC,
		missionName: 'toxic',
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 1500
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickfigo'
				},
				displayedAction: 'pickfigo',
				displayedText: 'pickfigo'
			},
			{
				stepId: 1,
				place: placeList.COLLINES_HANTEES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickpuru'
				},
				displayedAction: 'pickpuru',
				displayedText: 'pickpuru'
			},
			{
				stepId: 2,
				place: placeList.FLEUVE_JUMIN.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickvisqueuse'
				},
				displayedAction: 'pickvisqueuse',
				displayedText: 'pickvisqueuse'
			},
			{
				stepId: 3,
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'auree'
				},
				displayedAction: 'hulot',
				displayedText: 'hulot'
			}
		]
	},
	{
		missionId: MissionID.HULOT_MAP,
		missionName: 'map',
		condition: {
			[Operator.OR]: [
				{ [Operator.NOT]: { [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_TOXIC } },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_HUCURE }
			]
		},
		rewards: [
			{
				rewardType: RewardEnum.GOLD,
				value: 2500
			},
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 60
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.COLLINES_HANTEES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'drawMap'
				},
				displayedAction: 'drawMap',
				displayedText: 'drawMap',
				displayedHUD: 'findPickPoint'
			},
			{
				stepId: 1,
				place: placeList.COLLINES_HANTEES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'catchBat'
				},
				displayedAction: 'catchBat',
				displayedText: 'catchBat'
			},
			{
				stepId: 2,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'bat'
				},
				displayedAction: 'bat',
				displayedText: 'bat',
				displayedHUD: 'findBat'
			},
			{
				stepId: 3,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'launchRock'
				},
				displayedAction: 'launchRock',
				displayedText: 'launchRock'
			},
			{
				stepId: 4,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'bat',
					value: 1
				},
				displayedAction: 'killFauve',
				displayedText: 'killFauve'
			},
			{
				stepId: 5,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickNote'
				},
				displayedAction: 'pickNote',
				displayedText: 'pickNote'
			},
			{
				stepId: 6,
				place: placeList.COLLINES_HANTEES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'redraw'
				},
				displayedAction: 'redraw',
				displayedText: 'redraw',
				displayedHUD: 'returnColline'
			},
			{
				stepId: 7,
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'auree'
				},
				displayedAction: 'hulot',
				displayedText: 'hulot'
			}
		]
	},
	{
		missionId: MissionID.HULOT_HUCURE,
		missionName: 'hucure',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_TOXIC
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 60
			},
			{
				rewardType: RewardEnum.ITEM,
				value: itemList.POTION_ANGEL.itemId,
				quantity: 1
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickherbs'
				},
				displayedAction: 'pickherbs',
				displayedText: 'pickherbs'
			},
			{
				stepId: 1,
				place: placeList.CHUTES_MUTANTES.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'moinemedecin'
				},
				displayedAction: 'moinemedecin',
				displayedText: 'moinemedecin'
			},
			{
				stepId: 2,
				place: placeList.MINES_DE_CORAIL.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickCoral'
				},
				displayedAction: 'pickCoral',
				displayedText: 'pickCoral'
			},
			{
				stepId: 3,
				place: placeList.CHUTES_MUTANTES.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'moinemedecin'
				},
				displayedAction: 'moinemedecin',
				displayedText: 'moinemedecin2',
				displayedHUD: 'moinemedecinCoral'
			},
			{
				stepId: 4,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'korgon',
					value: 4
				},
				displayedAction: 'killKorgon',
				displayedText: 'killKorgon'
			},
			{
				stepId: 5,
				place: placeList.CHEMIN_GLAUQUE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickTeeth'
				},
				displayedAction: 'pickTeeth',
				displayedText: 'pickTeeth'
			},
			{
				stepId: 6,
				place: placeList.FLEUVE_JUMIN.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'bat',
					value: 5
				},
				displayedAction: 'killBat',
				displayedText: 'killBat'
			},
			{
				stepId: 7,
				place: placeList.FLEUVE_JUMIN.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickWings'
				},
				displayedAction: 'pickWings',
				displayedText: 'pickWings'
			},
			{
				stepId: 8,
				place: placeList.CHUTES_MUTANTES.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'moinemedecin'
				},
				displayedAction: 'moinemedecin',
				displayedText: 'moinemedecin3',
				displayedHUD: 'moineChutes'
			},
			{
				stepId: 9,
				place: placeList.CHUTES_MUTANTES.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'pickMedecine'
				},
				displayedAction: 'pickMedecine',
				displayedText: 'pickMedecine'
			},
			{
				stepId: 10,
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'auree'
				},
				displayedAction: 'hulot',
				displayedText: 'hulot'
			}
		]
	},
	{
		missionId: MissionID.HULOT_BCKPCK,
		missionName: 'bckpck',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_HUCURE },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.HULOT_MAP }
			]
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 60
			},
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.BACKPACK
			}
		],
		steps: [
			{
				stepId: 0,
				place: placeList.CHUTES_MUTANTES.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'extremFisher'
				},
				displayedAction: 'extremFisher',
				displayedText: 'extremFisher'
			},
			{
				stepId: 1,
				place: placeList.MARAIS_COLLANT.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'alguae'
				},
				displayedAction: 'alguae',
				displayedText: 'alguae'
			},
			{
				stepId: 2,
				place: placeList.MINES_DE_CORAIL.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'interogateMinors'
				},
				displayedAction: 'interogateMinors',
				displayedText: 'interogateMinors'
			},
			{
				stepId: 3,
				place: placeList.MINES_DE_CORAIL.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'minorHalt'
				},
				displayedAction: 'minorHalt',
				displayedText: 'minorHalt'
			},
			{
				stepId: 4,
				place: placeList.PORT_DE_PRECHE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'afraidFisher'
				},
				displayedAction: 'afraidFisher',
				displayedText: 'afraidFisher'
			},
			{
				stepId: 5,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'findBobine'
				},
				displayedAction: 'findBobine',
				displayedText: 'findBobine'
			},
			{
				stepId: 6,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'couturiere'
				},
				displayedAction: 'couturiere',
				displayedText: 'couturiere'
			},
			{
				stepId: 7,
				place: placeList.FOUTAINE_DE_JOUVENCE.name,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: 'coq',
					value: 2
				},
				displayedAction: 'killCoqAcharne',
				displayedText: 'killCoqAcharne'
			},
			{
				stepId: 8,
				place: placeList.DINOVILLE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'couturiere'
				},
				displayedAction: 'couturiere',
				displayedText: 'couturiere2',
				displayedHUD: 'dnvReport'
			},
			{
				stepId: 9,
				place: placeList.PORT_DE_PRECHE.name,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'afraidFisher'
				},
				displayedAction: 'afraidFisher',
				displayedText: 'afraidFisher2'
			},
			{
				stepId: 10,
				place: placeList.AUREE_DE_LA_FORET.name,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'auree'
				},
				displayedAction: 'hulot',
				displayedText: 'hulot'
			}
		]
	}
];
