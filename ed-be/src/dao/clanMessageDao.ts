import { prisma } from '../prisma.js';

export async function getDataForMessageDeletion(msgId: number) {
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
}
