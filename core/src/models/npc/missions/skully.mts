import { ConditionEnum, RewardEnum } from '../../enums/Parser.mjs';
import { PlaceEnum } from '../../enums/PlaceEnum.mjs';
import { monsterList } from '../../fight/MonsterList.mjs';
import { itemList, Item } from '../../item/ItemList.mjs';
import { Mission } from '../../missions/mission.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { MapZone } from '../../enums/MapZone.mjs';
import { DinozStatusId } from '../../dinoz/StatusList.mjs';

export const M_SKULLY: Mission[] = [
	// Missions 51 à 56
	{
		missionId: MissionID.SKULLY1,
		missionName: 'skully1',
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 10
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.PAPY_JOE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'papyjoe',
					npcName: 'papy'
				},
				displayedAction: 'ptitJoe',
				displayedText: 'ptitJoe1'
			},
			{
				stepId: 1,
				place: PlaceEnum.PAPY_JOE,
				requirement: {
					actionType: ConditionEnum.GIVE_ITEM,
					target: 'papyjoe',
					item: itemList[Item.GOBLIN_MERGUEZ],
					itemQuantity: 3,
					npcName: 'papy'
				},
				displayedAction: 'giveMerguez',
				displayedText: 'ptitJoe2'
			},
			{
				stepId: 2,
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'readMessage'
				},
				displayedAction: 'readMessage',
				displayedText: 'readMessage'
			},
			{
				stepId: 3,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'skull'
				},
				displayedAction: 'skully',
				displayedText: 'skully'
			}
		]
	},
	{
		missionId: MissionID.SKULLY2,
		missionName: 'skully2',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SKULLY1
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 20
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 1000
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'touriste'
				},
				displayedAction: 'touriste',
				displayedText: 'touriste'
			},
			{
				stepId: 1,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					mobList: [monsterList.ANGUIL, monsterList.ANGUIL],
					target: 'AAA',
					endText: {
						type: 'announce',
						text: 'AAA_end'
					},
					startText: {
						type: 'announce',
						text: 'AAA_start'
					}
				},
				displayedAction: 'AAA',
				displayedText: 'AAA3'
			},
			{
				stepId: 2,
				place: PlaceEnum.CHUTES_MUTANTES,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'pecheur'
				},
				displayedAction: 'pecheur',
				displayedText: 'fish1'
			},
			{
				stepId: 3,
				place: PlaceEnum.CHUTES_MUTANTES,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					mobList: [
						monsterList.PIRA,
						monsterList.PIRA,
						monsterList.PIRA,
						monsterList.PIRA,
						monsterList.PIRA,
						monsterList.PIRA
					],
					target: 'baiePira',
					startText: {
						type: 'announce',
						text: 'baiePira_start'
					},
					endText: {
						type: 'announce',
						text: 'baiePira_end'
					}
				},
				displayedAction: 'baiePira',
				displayedText: 'baiePira'
			},
			{
				stepId: 4,
				place: PlaceEnum.CHUTES_MUTANTES,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'pecheur'
				},
				displayedAction: 'pecheur',
				displayedText: 'fish2'
			},
			{
				stepId: 5,
				place: PlaceEnum.MARAIS_COLLANT,
				requirement: {
					actionType: ConditionEnum.DO,
					target: 'panneau'
				},
				displayedAction: 'panneau',
				displayedText: 'panneau'
			},
			{
				stepId: 6,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'skull'
				},
				displayedAction: 'skully',
				displayedText: 'skully'
			}
		]
	},
	{
		missionId: MissionID.SKULLY3,
		missionName: 'skully3',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SKULLY2
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 10
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 500
			},
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SKULLY_MEMORY
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.BAO_BOB,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'bao?',
					npcName: 'bob'
				},
				displayedAction: 'bao?',
				displayedText: 'bao?'
			},
			{
				stepId: 1,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'missBao',
					npcName: 'baobabe'
				},
				displayedAction: 'missBao',
				displayedText: 'missBao'
			},
			{
				stepId: 2,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'baoBabe',
					npcName: 'baobabe'
				},
				displayedAction: 'baoBabe',
				displayedText: 'baoBabe1'
			},
			{
				stepId: 3,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.KILL,
					target: [monsterList.GOBLIN.name],
					value: 10,
					zone: MapZone.GTOUTCHAUD
				},
				displayedAction: 'killGoblin',
				displayedText: 'killGoblin'
			},
			{
				stepId: 4,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'baoBabe',
					npcName: 'baobabe'
				},
				displayedAction: 'baoBabe',
				displayedText: 'baoBabe2'
			},
			{
				stepId: 5,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'baoBabe',
					npcName: 'baobabe'
				},
				displayedAction: 'baoBabe',
				displayedText: 'baoBabe3'
			},
			{
				stepId: 6,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'skull'
				},
				displayedAction: 'skully',
				displayedText: 'skully'
			}
		]
	},
	{
		missionId: MissionID.SKULLY4,
		missionName: 'skully4',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SKULLY3
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 40
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 2000
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'merguez',
					npcName: 'merguez'
				},
				displayedAction: 'merguez',
				displayedText: 'merguez'
			},
			{
				stepId: 1,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					mobList: [monsterList.BARABABOR, monsterList.BAMBOOZ_SPROUTING],
					target: 'visitRuin',
					endText: {
						type: 'announce',
						text: 'baraba_end'
					},
					dialog: {
						fid: -1,
						message: 'baraba_start'
					}
				},
				displayedAction: 'visitRuin'
			},
			{
				stepId: 2,
				place: PlaceEnum.PORT_DE_PRECHE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'PORT_DE_PRECHE',
					action: 'lookBoat'
				},
				displayedAction: 'lookBoat',
				displayedText: 'lookBoat'
			},
			{
				stepId: 3,
				place: PlaceEnum.PORT_DE_PRECHE,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					mobList: [monsterList.BARATRIBOR, monsterList.BAMBOOZ_SPROUTING],
					target: 'enterBoat',
					endText: {
						type: 'announce',
						text: 'boat_end'
					},
					dialog: {
						fid: -1,
						message: 'boat_start'
					}
				},
				displayedAction: 'enterBoat'
			},
			{
				stepId: 4,
				place: PlaceEnum.PORT_DE_PRECHE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'freeMan'
				},
				displayedAction: 'freeMan',
				displayedText: 'freeMan'
			},
			{
				stepId: 5,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'merguez',
					npcName: 'merguez'
				},
				displayedAction: 'merguez',
				displayedText: 'merguez2'
			},
			{
				stepId: 6,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'skull'
				},
				displayedAction: 'skully',
				displayedText: 'skully'
			}
		]
	},
	{
		missionId: MissionID.SKULLY5,
		missionName: 'skully5',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SKULLY4
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 30
			},
			{
				rewardType: RewardEnum.GOLD,
				value: 5000
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'skully',
					npcName: 'skully'
				},
				displayedAction: 'skully',
				displayedText: 'skully1'
			},
			{
				stepId: 1,
				place: PlaceEnum.DOME_SOULAFLOTTE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'shrimpSeller'
				},
				displayedAction: 'shrimpSeller',
				displayedText: 'shrimpSeller'
			},
			{
				stepId: 2,
				place: PlaceEnum.DOME_SOULAFLOTTE,
				requirement: {
					actionType: ConditionEnum.GIVE_ITEM,
					target: 'giveTreasure',
					item: itemList[Item.TREASURE_COUPON],
					itemQuantity: 3
				},
				displayedAction: 'shrimpSeller',
				displayedText: 'giveTreasure'
			},
			{
				stepId: 3,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'skully',
					npcName: 'skully'
				},
				displayedAction: 'skully',
				displayedText: 'skully2'
			},
			{
				stepId: 4,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'shamanM',
					npcName: 'shaman'
				},
				displayedAction: 'shamanM',
				displayedText: 'shaman'
			},
			{
				stepId: 5,
				place: PlaceEnum.FOSSELAVE,
				requirement: {
					actionType: ConditionEnum.GIVE_ITEM,
					target: 'giveSos',
					item: itemList[Item.SOS_FLAME],
					itemQuantity: 5,
					npcName: 'shaman'
				},
				displayedAction: 'giveSos',
				displayedText: 'giveSos'
			},
			{
				stepId: 6,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'skully',
					npcName: 'skully'
				},
				displayedAction: 'skully',
				displayedText: 'skully3'
			},
			{
				stepId: 7,
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				requirement: {
					actionType: ConditionEnum.LAUNCH_FIGHT,
					mobList: [monsterList.KORGON],
					target: 'korgon',
					dialog: {
						fid: -1,
						message: 'korgon_start'
					},
					endText: {
						type: 'announce',
						text: 'korgon_end'
					}
				},
				displayedAction: 'korgon',
				displayedText: 'korgon'
			},
			{
				stepId: 8,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'skully',
					npcName: 'skully'
				},
				displayedAction: 'skully',
				displayedText: 'skully4'
			},
			{
				stepId: 9,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'skull'
				},
				displayedAction: 'skully',
				displayedText: 'skull'
			}
		]
	},
	{
		missionId: MissionID.SKULLY_END,
		missionName: 'skully_end',
		condition: {
			[ConditionEnum.FINISHED_MISSION]: MissionID.SKULLY5
		},
		rewards: [
			{
				rewardType: RewardEnum.EXPERIENCE,
				value: 10
			}
		],
		steps: [
			{
				stepId: 0,
				place: PlaceEnum.RUINES_ASHPOUK,
				requirement: {
					actionType: ConditionEnum.TALKTO,
					target: 'merguez',
					npcName: 'merguez'
				},
				displayedAction: 'merguez',
				displayedText: 'merguez'
			},
			{
				stepId: 1,
				place: PlaceEnum.CIMETIERE,
				requirement: {
					actionType: ConditionEnum.FINISH_MISSION,
					target: 'skull'
				},
				displayedAction: 'skully',
				displayedText: 'skull'
			}
		]
	}
];
