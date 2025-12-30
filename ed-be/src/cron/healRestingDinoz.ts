import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { prisma } from '../prisma.js';
import { LOGGER } from '../context.js';
import dayjs from 'dayjs';
import { scheduleJob } from 'node-schedule';
import { ServerAction } from '@drpg/prisma';

const healRestingDinoz = async () => {
	const nextHour = dayjs().add(1, 'hour').startOf('hour').toDate();
	const MIDNIGHT_RESET_LOCK_ID = 999002;
	try {
		await prisma.$transaction(
			async tx => {
				await tx.$executeRaw`SELECT pg_advisory_xact_lock(${MIDNIGHT_RESET_LOCK_ID})`;
				await prisma.$executeRaw`
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
													 ))
						FROM
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
            ( ${Skill.COCON}
						, ${Skill.REGENERESCENCE}
						)
						GROUP BY
						ds."dinozId"
						)
						sg
					ON sg."dinozId" = d.id
						LEFT JOIN
						player p
						ON p.id = d."playerId"
						AND p.priest = TRUE -- Prêtre
						LEFT JOIN
						dinoz_skill heart
						ON heart."dinozId" = d.id
						AND heart."skillId" = ${Skill.COEUR_DU_PHOENIX} -- Coeur de phénix
						LEFT JOIN
						dinoz_skill divine
						ON divine."dinozId" = d.id
						AND divine."skillId" = ${Skill.EAU_DIVINE} -- Eau divine
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
				await tx.serverState.update({
					where: {
						action: ServerAction.healRestingDinoz
					},
					data: {
						nextCheck: nextHour
					}
				});
			},
			{
				timeout: 45000
			}
		);
		scheduleJob('healRestingDinoz', nextHour, () => healRestingDinoz());
	} catch (err) {
		LOGGER.error(`Cannot heal resting dinoz: ${err}`);
	}
};

export { healRestingDinoz };
