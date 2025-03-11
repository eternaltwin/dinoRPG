import { SkillEffects } from '@drpg/core/models/dinoz/SkillDetails';
import { Stat } from '@drpg/core/models/enums/SkillStat';
import { updateDinoz, updateEventDinoz } from '../dao/dinozDao.js';
import { Dinoz, GameDinozUsage } from '@drpg/prisma';

async function effectParser(
	effects: SkillEffects,
	dinoz: Pick<Dinoz, 'id' | 'maxLife' | 'nbrUpFire' | 'nbrUpAir' | 'nbrUpLightning' | 'nbrUpWater' | 'nbrUpWood'>,
	event?: GameDinozUsage
) {
	for (const [stat, value] of Object.entries(effects)) {
		switch (stat) {
			case Stat.MAX_HP:
				dinoz.maxLife += +value;
				break;
			case Stat.FIRE_ELEMENT:
				dinoz.nbrUpFire += +value;
				break;
			case Stat.WATER_ELEMENT:
				dinoz.nbrUpWater += +value;
				break;
			case Stat.WOOD_ELEMENT:
				dinoz.nbrUpWood += +value;
				break;
			case Stat.AIR_ELEMENT:
				dinoz.nbrUpAir += +value;
				break;
			case Stat.LIGHTNING_ELEMENT:
				dinoz.nbrUpLightning += +value;
				break;
			default:
				break;
		}
	}
	if (event) {
		await updateEventDinoz(dinoz.id, {
			maxLife: dinoz.maxLife,
			nbrUpFire: dinoz.nbrUpFire,
			nbrUpWood: dinoz.nbrUpWood,
			nbrUpWater: dinoz.nbrUpWater,
			nbrUpLightning: dinoz.nbrUpLightning,
			nbrUpAir: dinoz.nbrUpAir
		});
	} else {
		await updateDinoz(dinoz.id, {
			maxLife: dinoz.maxLife,
			nbrUpFire: dinoz.nbrUpFire,
			nbrUpWood: dinoz.nbrUpWood,
			nbrUpWater: dinoz.nbrUpWater,
			nbrUpLightning: dinoz.nbrUpLightning,
			nbrUpAir: dinoz.nbrUpAir
		});
	}
}

export { effectParser };
