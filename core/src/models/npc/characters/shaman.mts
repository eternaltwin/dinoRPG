import { statusList } from '../../dinoz/StatusList.mjs';
import { ConditionEnum, Operator, RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

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
			[Operator.NOT]: { [ConditionEnum.STATUS]: statusList.SHFLAG }
		},
		nextStep: ['more', 'merci']
	},
	missions: {
		stepName: 'missions',
		condition: {
			[ConditionEnum.STATUS]: statusList.SHFLAG
		},
		nextStep: []
	},
	charm: {
		stepName: 'charm',
		condition: {
			[ConditionEnum.STATUS]: statusList.FFLAG
		},
		nextStep: ['boost', 'nothing']
	},
	boost: {
		stepName: 'boost',
		condition: {
			[Operator.NOT]: { [ConditionEnum.STATUS]: statusList.FIRE_CHARM }
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
