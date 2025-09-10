import { ItemEffect } from '../enums/ItemEffect.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { RaceEnum } from '../enums/RaceEnum.mjs';

export type ItemEffects =
	| {
			category: ItemEffect.HEAL | ItemEffect.RESURRECT | ItemEffect.ACTION | ItemEffect.GOLD;
			value: number;
	  }
	| {
			category: ItemEffect.EGG;
			race: RaceEnum;
	  }
	| {
			category: ItemEffect.SPHERE;
			value: ElementType;
	  }
	| {
			category: ItemEffect.SPECIAL;
			value: string;
	  };
