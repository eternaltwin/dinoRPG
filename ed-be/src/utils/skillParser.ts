import { SkillEffects } from '@drpg/core/models/dinoz/DinozSkillFiche';
import { setDinoz } from '../dao/dinozDao.js';
import { Dinoz } from '../entity/index.js';
import { SkillEffectType } from '@drpg/core/models/dinoz/SkillEffectType';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { Stat } from '@drpg/core/models/enums/SkillStat';

async function effectParser(effects: SkillEffects, dinoz: Dinoz): Promise<void> {
	for (const [stat, value] of Object.entries(effects)) {
		switch (stat) {
			case Stat.MAX_HP:
				dinoz.maxLife += +value;
				break;
			default:
				break;
		}
	}
	await setDinoz(dinoz);
}

export { effectParser };
