import { statusList } from "../../dinoz/StatusList.mjs";
import { ConditionEnum, RewardEnum } from "../../enums/Parser.mjs";
import { NpcData } from "../NpcData.mjs";

export const SHAMAN: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['vener', 'souvenir', 'missions', 'charm'],
		initialStep: true
	},
	vener: {
		stepName: 'vener',
		nextStep: ['force', 'merci']
	},
	souvenir: {
		stepName: 'souvenir',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.SHFLAG,
			reverse: true
		},
		nextStep: ['more', 'merci']
	},
	missions: {
		stepName: 'missions',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.SHFLAG
		},
		nextStep: []
	},
	charm: {
		stepName: 'charm',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.FFLAG
		},
		nextStep: ['boost', 'nothing']
	},
	boost: {
		stepName: 'boost',
		condition: {
			conditionType: ConditionEnum.STATUS,
			value: statusList.FIRE_CHARM,
			reverse: true
		},
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: statusList.FIRE_CHARM
			}
		],
		nextStep: []
	},
	nothing: {
		stepName: 'nothing',
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
				value: statusList.SHFLAG
			}
		],
		nextStep: ['missions']
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
