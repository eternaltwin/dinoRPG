import { SkillEffects } from '@drpg/core/models/dinoz/DinozSkillFiche';
import { Stat } from '@drpg/core/models/enums/SkillStat';
import { updateDinoz } from '../dao/dinozDao.js';
import { Dinoz } from '@drpg/prisma';

async function effectParser(
	effects: SkillEffects,
	dinoz: Pick<Dinoz, 'id' | 'maxLife'>
) {
	for (const [stat, value] of Object.entries(effects)) {
		switch (stat) {
			case Stat.MAX_HP:
				dinoz.maxLife += +value;
				break;
			default:
				break;
		}
	}
	await updateDinoz(dinoz.id, { maxLife: dinoz.maxLife });
}

export { effectParser };
