import { DinozStatusId } from '../../dinoz/StatusList.mjs';
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
			[Operator.NOT]: { [ConditionEnum.STATUS]: DinozStatusId.SHFLAG }
		},
		nextStep: ['more', 'merci']
	},
	missions: {
		stepName: 'missions',
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.SHFLAG
		},
		nextStep: []
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
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
