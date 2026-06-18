import { prisma } from '../prisma.js';
import { withSpan } from '../utils/server/tracing.js';

export async function getDataForMessageDeletion(msgId: number) {
	return withSpan(getDataForMessageDeletion.name, async () => {
		return await prisma.clanMessage.findUnique({
			select: {
				id: true,
				authorId: true,
				clan: {
					select: {
						id: true,
						leaderId: true,
						members: {
							select: {
								playerId: true
							}
						}
					}
				}
			},
			where: { id: msgId }
		});
	});
}
