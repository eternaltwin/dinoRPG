import { ElementType } from '../enums/ElementType.mjs';
import { RewardEnum } from '../enums/Parser.mjs';

export type Rewarder =
	| {
			rewardType: RewardEnum.CHANGE_ELEMENT;
			value: ElementType;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.STATUS | RewardEnum.EPIC;
			value: string;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.ITEM;
			value: string;
			quantity: number;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.SCENARIO;
			name: string;
			step: number;
			reverse?: boolean;
	  }
	| {
			rewardType: Exclude<
				RewardEnum,
				RewardEnum.CHANGE_ELEMENT | RewardEnum.STATUS | RewardEnum.ITEM | RewardEnum.EPIC | RewardEnum.SCENARIO
			>;
			value: number;
			reverse?: boolean;
	  };
