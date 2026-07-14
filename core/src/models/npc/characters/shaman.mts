import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { Comparator, ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';
import { Scenario } from '../../enums/Scenario.mjs';
import { Ingredient } from '../../ingredient/ingredientList.mjs';
import { MissionID } from '../../missions/missionList.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';

export const SHAMAN: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['vener', 'souvenir', 'missions', 'charm', 'pac_scroll', 'pac_root'],
		initialStep: true
	},
	vener: {
		stepName: 'vener',
		nextStep: ['force', 'merci']
	},
	souvenir: {
		stepName: 'souvenir',
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SHFLAG }
		},
		nextStep: ['more', 'merci']
	},
	missions: {
		stepName: 'missions',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.SHFLAG
		},
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		]
	},
	charm: {
		stepName: 'charm',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.FFLAG
		},
		nextStep: ['boost', 'nothing']
	},
	boost: {
		stepName: 'boost',
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.FIRE_CHARM }
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FIRE_CHARM
			}
		],
		nextStep: []
	},
	nothing: {
		stepName: 'nothing',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.FIRE_CHARM
		},
		nextStep: []
	},
	force: {
		stepName: 'force',
		nextStep: ['merci']
	},
	merci: {
		stepName: 'merci',
		nextStep: []
	},
	more: {
		stepName: 'more',
		nextStep: ['accept']
	},
	accept: {
		stepName: 'accept',
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.SHFLAG
			}
		],
		nextStep: ['missions']
	},
	pac_scroll: {
		stepName: 'pac_scroll',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.SCENARIO]: [Scenario.PAC, 1, '='] },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_JOKE }
			]
		},
		nextStep: ['pac_scroll2']
	},
	pac_scroll2: {
		stepName: 'pac_scroll2',
		condition: {
			[ConditionEnum.SCENARIO]: [Scenario.PAC, 1, '=']
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.PAC,
				step: 2
			}
		],
		nextStep: []
	},
	pac_root: {
		stepName: 'pac_root',
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.POSSESS_INGREDIENT]: [Ingredient.RACINE_DE_FIGONICIA, Comparator.GREATER_EQUAL, 1] },
				{ [ConditionEnum.SCENARIO]: [Scenario.PAC, 2, '='] },
				{ [ConditionEnum.FINISHED_MISSION]: MissionID.SHAMAN_JOKE }
			]
		},
		reward: [
			{
				rewardType: RewardEnum.SCENARIO,
				value: Scenario.PAC,
				step: 3
			}
		],
		nextStep: []
	}
};
