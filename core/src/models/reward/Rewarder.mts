import { ElementType } from '../enums/ElementType.mjs';
import { RewardEnum } from '../enums/Parser.mjs';
import { Place } from '../place/Place.mjs';
import { ServiceEnum } from '../enums/ServiceEnum.mjs';

export type Rewarder =
	| {
			rewardType: RewardEnum.CHANGE_ELEMENT;
			value: ElementType;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.EPIC;
			value: string;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.ITEM;
			value: number;
			quantity: number;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.STATUS;
			value: number;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.SCENARIO;
			name: string;
			step: number;
			reverse?: boolean;
	  }
	| {
			rewardType: RewardEnum.TELEPORT;
			place: Place;
	  }
	| {
			rewardType: RewardEnum.REDIRECT;
			service: ServiceEnum;
	  }
	| {
			rewardType: Exclude<
				RewardEnum,
				| RewardEnum.CHANGE_ELEMENT
				| RewardEnum.STATUS
				| RewardEnum.ITEM
				| RewardEnum.EPIC
				| RewardEnum.SCENARIO
				| RewardEnum.TELEPORT
				| RewardEnum.REDIRECT
			>;
			value: number;
			reverse?: boolean;
	  };
