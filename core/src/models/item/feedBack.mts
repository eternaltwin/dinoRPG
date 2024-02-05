import { ItemEffect } from '../enums/ItemEffect.mjs';

export type ItemFeedBack =
	| {
			category: ItemEffect.HEAL | ItemEffect.GOLD;
			value: number;
	  }
	| {
			category: ItemEffect.ACTION;
	  }
	| {
			category: ItemEffect.RESURRECT;
	  }
	| {
			category: ItemEffect.EGG | ItemEffect.SPHERE;
			value: string;
	  }
	| {
			category: ItemEffect.SPECIAL;
			value: string;
			effect: string;
	  };
