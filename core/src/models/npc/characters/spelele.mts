import { DinozStatusId } from '../../dinoz/StatusList.mjs';
import { RewardEnum } from '../../enums/Parser.mjs';
import { NpcData } from '../NpcData.mjs';

export const SPELELE: Readonly<Record<string, NpcData>> = {
	begin: {
		stepName: 'begin',
		nextStep: ['talk'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		nextStep: ['gla', 'bye']
	},
	gla: {
		stepName: 'gla',
		nextStep: ['ok', 'bye']
	},
	ok: {
		stepName: 'ok',
		nextStep: ['ok2', 'bye']
	},
	ok2: {
		stepName: 'ok2',
		nextStep: ['ok3', 'bye']
	},
	ok3: {
		stepName: 'ok3',
		nextStep: ['congel', 'bye']
	},
	congel: {
		stepName: 'congel',
		nextStep: ['congel2', 'bye'],
		alias: 'again'
	},
	congel2: {
		stepName: 'congel2',
		nextStep: ['again', 'thanks']
	},
	again: {
		stepName: 'again',
		nextStep: [],
		redirect: 'congel'
	},
	thanks: {
		stepName: 'thanks',
		nextStep: [],
		reward: [
			{
				rewardType: RewardEnum.STATUS,
				value: DinozStatusId.FSPELE
			}
		]
	},
	bye: {
		stepName: 'bye',
		nextStep: []
	}
};
