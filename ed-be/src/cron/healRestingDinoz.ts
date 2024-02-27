import cron from 'cron';
import { getAllResting, updateDinoz } from '../dao/dinozDao.js';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { BaseStats } from '@drpg/core/utils/getSpecialStat';
import { SpecialStat } from '@drpg/core/utils/getSpecialStat';
import { Stat } from '@drpg/core/models/enums/SkillStat';
import { sendDiscord } from '../utils/discord.js';
import dayjs from 'dayjs';

// Truncate table 'player_dinoz_shop' at midnight
const healRestingDinoz = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 * * * *', async () => {
		sendDiscord(`Start healing resting dinoz.`);
		const startTime = dayjs();
		try {
			const dinozList = await getAllResting();
			for (const dinoz of dinozList) {
				const skills = dinoz.skills.map(skill => Object.values(skillList).find(s => s.id === skill.skillId));
				let value = BaseStats[SpecialStat.HP_REGEN];
				let multiplier = 1;
				skills.forEach(skill => {
					if (!skill || !skill.effects) return;
					if (Object.keys(skill.effects).some(e => e === Stat.HP_REGEN)) {
						const effect = skill.effects[SpecialStat.HP_REGEN];
						if (!effect) return;

						// Flat value
						if (typeof effect === 'number') {
							value += effect;
						} else {
							// Multiplier
							multiplier *= effect[1];
						}
					}
				});
				await updateDinoz(dinoz.id, { life: Math.round(dinoz.life + value * multiplier) });
			}
			const endTime = dayjs();
			sendDiscord(`Healed ${dinozList.length} resting dinoz. Operation ended in ${endTime.diff(startTime)}ms.`);
			// await heal
		} catch (err) {
			console.error(`Cannot heal resting dinoz: ${err}`);
		}
	});
};

export { healRestingDinoz };
