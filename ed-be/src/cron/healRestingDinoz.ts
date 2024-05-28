import cron from 'cron';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import dayjs from 'dayjs';
import { prisma } from '../prisma.js';
import { LOGGER } from '../context.js';

// Truncate table 'player_dinoz_shop' at midnight
const healRestingDinoz = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 * * * *', async () => {
		const startTime = dayjs();
		try {
			const healed = await prisma.$executeRaw`
				UPDATE
					dinoz du
				SET life = least(d.life + ( -- Repos
																		1 -- Cocon + régen (+2*x)
																			+ COALESCE(sg.life, 0) -- Prêtre (+1)
																			+
																		CASE
																			WHEN
																				p.id IS NULL
																				THEN
																				0
																			ELSE
																				1
																			END
																		-- Eau divine (x2)
																		) *
																	CASE
																		WHEN
																			divine.id IS NULL
																			THEN
																			1
																		ELSE
																			2
																		END
					, -- Coeur de phénix (max vie 65% au lieu de 50%)
												 ROUND(d."maxLife" *
															 CASE
																 WHEN
																	 heart.id IS NULL
																	 THEN
																	 0.5
																 ELSE
																	 0.65
																 END
												 )) FROM
   dinoz d -- Cocon + Régen
   LEFT JOIN
      (
         SELECT
            ds."dinozId",
            COUNT(*) * 2 life
         FROM
            dinoz_skill ds
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
					AND p.priest = TRUE   -- Prêtre
					LEFT JOIN
					dinoz_skill heart
					ON heart."dinozId" = d.id
					AND heart."skillId" = ${Skill.COEUR_DU_PHOENIX} -- Coeur de phénix
					LEFT JOIN
					dinoz_skill divine
					ON divine."dinozId" = d.id
					AND divine."skillId" = ${Skill.EAU_DIVINE}  -- Eau divine
				WHERE
					d.id = du.id
					AND d."unavailableReason" = 'resting'
					AND
						(
					d.life
						< ROUND(d."maxLife" *
					CASE
					WHEN
					heart.id IS NULL
					THEN
					0.5
					ELSE
					0.65
					END
					)
					)
				;

			`;
			const endTime = dayjs();
			LOGGER.log(`Operation healed ${healed} dinoz and ended in ${endTime.diff(startTime)}ms.`);
		} catch (err) {
			console.error(`Cannot heal resting dinoz: ${err}`);
		}
	});
};

export { healRestingDinoz };
