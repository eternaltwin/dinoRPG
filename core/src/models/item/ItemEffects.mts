import { ItemEffect } from '../enums/ItemEffect.mjs';
import { DinozRace } from '../dinoz/DinozRace.mjs';

export type ItemEffects =
	| {
			category: ItemEffect.HEAL | ItemEffect.RESURRECT | ItemEffect.ACTION;
			value: number;
	  }
	| {
			category: ItemEffect.EGG;
			race: DinozRace;
			rare: boolean;
	  };
