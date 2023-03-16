import { RewardEnum } from '@/enums/index.js';

export type missionRewards =
	| {
			rewardType: RewardEnum.ITEM;
			value: string;
			quantity: number;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.STATUS | RewardEnum.EPIC;
			value: string;
	  }
	| {
			rewardType: Exclude<RewardEnum, RewardEnum.STATUS | RewardEnum.ITEM | RewardEnum.EPIC>;
			value: number;
			reverse?: boolean;
	  };
