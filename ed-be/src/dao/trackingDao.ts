import { GetStatRankingsResponse } from '@drpg/core/returnTypes/Ranking';
import { prisma } from '../prisma.js';
import { Prisma } from '@drpg/prisma';
import { StatTracking } from '@drpg/core/models/enums/statTracking';

export function setSpecificStat(stat: string, playerId: string, quantity: number) {
	return prisma.playerTracking.upsert({
		where: { stat_playerId: { stat, playerId } },
		update: {
			quantity: { increment: quantity }
		},
		create: {
			stat: stat,
			quantity: quantity,
			playerId: playerId
		}
	});
}

export async function getEveryStatTop3() {
	const top3: GetStatRankingsResponse = await prisma.$queryRaw`
		SELECT s.stat, s."playerId", s.quantity, p.name AS "playerName"
		FROM (
			SELECT stat, "playerId", quantity,
				ROW_NUMBER() OVER (PARTITION BY stat ORDER BY quantity DESC) AS row_number
			FROM "playerTracking"
			WHERE stat IN (${Prisma.join(Object.values(StatTracking))})
		) AS s
		LEFT JOIN "player" p ON s."playerId" = p.id
		WHERE s.row_number <= 3
		ORDER BY s.stat, s.quantity DESC;
	`;

	return top3;
}
