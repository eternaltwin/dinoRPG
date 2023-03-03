import { RewardEnum } from '@/enums/index.js';

export interface missionRewards {
	rewardType: RewardEnum;
	quantity: number;
	value?: string;
}
