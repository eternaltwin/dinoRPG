import dayjs from 'dayjs';
import { prisma } from '../prisma.js';
import { $Enums, ServerAction } from '@drpg/prisma';
import { LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';
import UnavailableReason = $Enums.UnavailableReason;
import { SHARED_DINOZ_OPERATIONS_LOCK } from '../constants/index.js';

const midnightReset = async () => {
	const tommorow = dayjs().add(1, 'day').startOf('day').toDate();
	try {
		await prisma.$transaction(
			async tx => {
				await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SHARED_DINOZ_OPERATIONS_LOCK})`;
				// Unfreeze dinoz
				await tx.dinoz.updateMany({
					where: {
						unavailableReason: UnavailableReason.unfreezing
					},
					data: {
						unavailableReason: null
					}
				});

				// Fount healing
				const lifeIncrement = 5;
				await tx.$executeRaw`
				UPDATE dinoz
				SET life = LEAST(
					life + ${lifeIncrement},
					"maxLife"
									 )
				WHERE id IN (
					SELECT d.id
					FROM dinoz d
					WHERE d."placeId" = 7 -- Fontaine de Jouvence
						AND d.life < d."maxLife"
						AND EXISTS (
						SELECT 1
						FROM player p
									 JOIN player_reward pr ON pr."playerId" = p.id
						WHERE pr."rewardId" = 1 -- Perle
							AND p.id = d."playerId"
					)
					ORDER BY d.id
					FOR UPDATE
								)
			`;

				// Dinoz shop
				await tx.playerDinozShop.deleteMany();

				// Demon shop
				await tx.playerDemonShop.deleteMany();

				// Dojo things
				await tx.dojoOpponents.deleteMany();
				await tx.dojoTeam.deleteMany();
				await tx.dojo.updateMany({
					data: {
						dailyReset: 0
					}
				});

				// Reset daily counter for events
				await tx.events.updateMany({
					data: {
						dailyProgression: 0
					}
				});

				// Schedule the next run
				await tx.serverState.update({
					where: {
						action: ServerAction.midnightReset
					},
					data: {
						nextCheck: tommorow
					}
				});
			},
			{
				timeout: 30000,
				isolationLevel: 'ReadCommitted'
			}
		);
	} catch (err) {
		LOGGER.error(`Cannot perform midnight actions: ${err}`);
	}
	scheduleJob('midnightReset', tommorow, () => midnightReset());
};

export { midnightReset };
