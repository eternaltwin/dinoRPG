import { DISCORD, GLOBAL } from '../context.js';
import { getDinozForAnnounce } from '../dao/dinozDao.js';
import { PantheonMotif } from '@drpg/prisma';
import { addDinozToPantheon, addPlayerToPantheon, getPantheonFromType } from '../dao/pantheonDao.js';
import { translateAll } from './translate.js';
import { getPlayerForAnnounce } from '../dao/playerDao.js';
import { Reward, rewardList } from '@drpg/core/models/reward/RewardList';

export async function checkAnnounce(type: PantheonMotif, id: string, rewardId?: number) {
	if (GLOBAL.config.eternaltwin.channel !== 'production') return
	const pantheon = await getPantheonFromType(type);
	switch (type) {
		case PantheonMotif.race:
			const dinoz = await getDinozForAnnounce(+id);
			const raceAtThisLevel = pantheon
				.filter(p => p.dinoz?.raceId === dinoz.raceId)
				.filter(p => p.indicator === dinoz.level);
			if (raceAtThisLevel.length <= 4) {
				DISCORD.sendNotification(
					translateAll('announce.dinoz', {
						player: dinoz.player.name,
						position: raceAtThisLevel.length + 1,
						dinoz: dinoz.name,
						race: dinoz.raceId,
						level: dinoz.level
					})
				);
				await addDinozToPantheon(type, dinoz);
			}
			break;
		case PantheonMotif.epic:
			const player = await getPlayerForAnnounce(id);
			if (rewardId && player) {
				const reward = rewardList[rewardId as Reward];
				const rewardQuantityInPantheon = pantheon.filter(p => p.indicator === rewardId);
				if (reward.announced && rewardQuantityInPantheon.length <= 4) {
					await addPlayerToPantheon(type, player, rewardId);
					DISCORD.sendNotification(
						translateAll('announce.epic', {
							player: player.name,
							position: rewardQuantityInPantheon.length + 1,
							reward: reward.name
						})
					);
				}
			}

			break;
		default:
			break;
	}
}
