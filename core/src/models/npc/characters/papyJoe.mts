import { NpcData } from '../NpcData.mjs';
import { RewardEnum } from '../../enums/Parser.mjs';
import { ServiceEnum } from '../../enums/ServiceEnum.mjs';

export const PAPYJOE: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['missions'],
		initialStep: true
	},
	missions: {
		stepName: 'missions',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.REDIRECT,
				service: [ServiceEnum.MISSIONS]
			}
		]
	},
	stop: {
		stepName: 'stop',
		nextStep: []
	}
};
