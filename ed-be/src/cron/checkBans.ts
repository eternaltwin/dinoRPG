import cron from 'cron';
import { LOGGER } from '../context.js';
import { getAllBannedPlayers } from '../dao/playerDao.js';
import { ModerationAction } from '@drpg/prisma';
import { setModerationReport } from '../dao/moderationDao.js';

const checkBans = () => {
	const CronJob = cron.CronJob;

	return new CronJob('* * * * *', async () => {
		try {
			const bannedPlayers = await getAllBannedPlayers();

			for (const player of bannedPlayers) {
				// This should not happen but Typescript is not happy.
				if (!player.banCase) {
					console.error(`Could not find ban case for ${player.name} (${player.id})`);
					continue;
				}

				// Skip any player banned indefinitely
				if (player.banCase.sorted === ModerationAction.infiniteBan) {
					continue;
				}

				if (!player.banCase.banEndDate) {
					console.error(`Banned case for ${player.name} (${player.id}) missing end date`);
					continue;
				}

				// Remove the ban if it expired
				if (player.banCase.banEndDate <= new Date()) {
					await setModerationReport(player.banCase.id, { bannedUser: { disconnect: true } });
					LOGGER.log(`Player ${player.name} (${player.id}) ban expired`);
				}
			}
		} catch (err) {
			console.error(`Failed to check player bans: ${err}`);
		}
	});
};

export { checkBans };
