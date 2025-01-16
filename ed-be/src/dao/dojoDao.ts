import { prisma } from '../prisma.js';

export async function getMyDojoDao(playerId: string) {
	const dojo = await prisma.dojo.findUnique({
		where: {
			playerId: playerId
		}
	});
	return dojo;
}

export async function createMyDojo(playerId: string) {
	const dojo = await prisma.dojo.create({
		data: {
			player: { connect: { id: playerId } }
		}
	});
	return dojo;
}

export async function createMyTeamDao(dinozList: number[], dojoId: string) {
	for (const dinoz of dinozList) {
		await prisma.dojoTeam.create({
			data: {
				dinoz: { connect: { id: dinoz } },
				dojo: { connect: { id: dojoId } }
			}
		});
	}
	const dojo = await prisma.dojo.findUniqueOrThrow({
		where: {
			id: dojoId
		},
		select: {
			id: true,
			player: {
				select: {
					id: true,
					name: true
				}
			},
			team: {
				select: {
					dinoz: {
						select: {
							id: true,
							name: true,
							level: true,
							display: true
						}
					},
					fighted: true
				}
			},
			activeChallenge: true,
			reputation: true
		}
	});
	return dojo;
}
