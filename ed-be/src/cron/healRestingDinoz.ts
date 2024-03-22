import cron from 'cron';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { sendDiscord } from '../utils/discord.js';
import dayjs from 'dayjs';
import { prisma } from '../prisma.js';

// Truncate table 'player_dinoz_shop' at midnight
const healRestingDinoz = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 * * * *', async () => {
		sendDiscord(`Start healing resting dinoz.`);
		const startTime = dayjs();
		try {
			await prisma.$queryRaw`
				UPDATE
					dinoz du
				SET
					life = least(d.life + COALESCE(sg.life, 1) +
											 CASE
												 WHEN
													 p.id IS NULL
													 THEN
													 0
												 ELSE
													 1
												 END
						, d."maxLife" / 2)
					FROM
   dinoz d
   LEFT JOIN
      (
         SELECT
            ds."dinozId",
            COUNT(*) * 2 life
         FROM
            "dinoz_skill" ds
         WHERE
            ds."skillId" IN
            (
               ${Skill.COCON},
               ${Skill.REGENERESCENCE}
            )
         GROUP BY
            ds."dinozId"
      )
      sg
				ON sg."dinozId" = d.id
					LEFT JOIN
					player p
					ON p.id = d."playerId"
					AND p.priest = TRUE
				WHERE
					d.id = du.id
					AND d.resting = TRUE
					AND
						(
					d.life < (d."maxLife" / 2)
					)
				;
`;
			const endTime = dayjs();
			sendDiscord(`Operation ended in ${endTime.diff(startTime)}ms.`);
		} catch (err) {
			console.error(`Cannot heal resting dinoz: ${err}`);
		}
	});
};

export { healRestingDinoz };
