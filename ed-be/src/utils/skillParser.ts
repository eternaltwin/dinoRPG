import { ElementType, SkillEffect, SkillEffectType } from '../models/index.js';
import { setDinoz } from '../dao/dinozDao.js';
import { Dinoz } from '../entity/index.js';

async function effectParser(ooce: Array<SkillEffectType>, dinoz: Dinoz): Promise<void> {
	for (const e of ooce) {
		const effect: string = e.type;
		switch (effect) {
			case SkillEffect.CHANGE_MAX_LIFE:
				dinoz.maxLife += e.value;
				break;
			case SkillEffect.CHANGE_ELEMENT:
				switch (e.element) {
					case ElementType.FIRE:
						dinoz.nbrUpFire += e.value;
						break;
					case ElementType.WATER:
						dinoz.nbrUpWater += e.value;
						break;
					case ElementType.WOOD:
						dinoz.nbrUpWood += e.value;
						break;
					case ElementType.LIGHTNING:
						dinoz.nbrUpLightning += e.value;
						break;
					case ElementType.AIR:
						dinoz.nbrUpAir += e.value;
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}
	}
	await setDinoz(dinoz);
}

export { effectParser };
