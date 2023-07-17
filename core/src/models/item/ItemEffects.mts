import { ItemEffect } from '../enums/ItemEffect.mjs';
import { DinozRace } from '../dinoz/DinozRace.mjs';
import { ElementType } from '../enums/ElementType.mjs';

export type ItemEffects =
	| {
			category: ItemEffect.HEAL | ItemEffect.RESURRECT | ItemEffect.ACTION | ItemEffect.GOLD;
			value: number;
	  }
	| {
			category: ItemEffect.EGG;
			race: DinozRace;
			rare: boolean;
	  }
	| {
			category: ItemEffect.SPHERE;
			value: ElementType;
	  }
	| {
			category: ItemEffect.SPECIAL;
			value: string;
	  };
