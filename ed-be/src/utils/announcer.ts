import { DISCORD, GLOBAL } from '../context.js';
import { getDinozForAnnounce } from '../dao/dinozDao.js';
import { PantheonMotif } from '@drpg/prisma';
import { addDinozToPantheon, addPlayerToPantheon, getPantheonFromType } from '../dao/pantheonDao.js';
import { translateAll } from './translate.js';
import { getPlayerForAnnounce } from '../dao/playerDao.js';
import { Reward, rewardList } from '@drpg/core/models/reward/RewardList';
import { renderBigDino } from '@drpg/renderer';

export async function checkAnnounce(type: PantheonMotif, id: string, extension: number | string) {
	if (GLOBAL.config.eternaltwin.channel !== 'production') return;
	const pantheon = await getPantheonFromType(type);
	switch (type) {
		case PantheonMotif.race:
			const dinoz = await getDinozForAnnounce(+id);
			const raceAtThisLevel = pantheon
				.filter(p => p.dinoz?.raceId === dinoz.raceId)
				.filter(p => p.indicator === dinoz.level);
			if (raceAtThisLevel.some(d => d.dinoz?.id === +id)) {
				break;
			}
			if (raceAtThisLevel.length <= 4) {
				const big: Buffer = await renderBigDino(dinoz.display);
				DISCORD.sendPantheonNotification(
					translateAll('announce.dinoz', {
						position: raceAtThisLevel.length + 1,
						race: dinoz.raceId,
						level: dinoz.level
					}),
					dinoz.player,
					big
				);
				await addDinozToPantheon(type, dinoz, big);
			}
			break;
		case PantheonMotif.epic:
			const player = await getPlayerForAnnounce(id);
			if (+extension && player) {
				const reward = rewardList[+extension as Reward];
				const rewardQuantityInPantheon = pantheon.filter(p => p.indicator === +extension);
				if (reward.announced && rewardQuantityInPantheon.length <= 4) {
					await addPlayerToPantheon(type, player, +extension);
					DISCORD.sendPantheonNotification(
						translateAll('announce.epic', {
							player: player.name,
							position: rewardQuantityInPantheon.length + 1,
							reward: reward.name
						}),
						player
					);
				}
			}

			break;
		default:
			break;
	}
}
