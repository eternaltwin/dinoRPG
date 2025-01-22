import { prisma } from '../prisma.js';

export async function getMyDojoDao(playerId: string) {
	const dojo = await prisma.dojo.findUnique({
		where: {
			playerId: playerId
		},
		select: {
			DojoChallengeHistory: {
				select: {
					victory: true,
					achieved: true
				}
			},
			id: true,
			playerId: true,
			reputation: true,
			activeChallenge: true
		}
	});
	return dojo;
}

export async function getMyTeamDao(playerId: string) {
	const dojo = await prisma.dojo.findUnique({
		where: {
			playerId: playerId
		},
		select: {
			id: true,
			playerId: true,
			dailyReset: true,
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
			DojoOpponents: {
				select: {
					fighted: true,
					achieved: true,
					dinoz: {
						select: {
							id: true,
							display: true,
							level: true,
							name: true
						}
					}
				}
			}
		}
	});
	return dojo;
}

export async function cleanCurrentOpponentTeam(dojoId: string) {
	await prisma.dojoOpponents.deleteMany({
		where: {
			dojoId: dojoId
		}
	});
	await prisma.dojoTeam.updateMany({
		where: {
			dojoId: dojoId
		},
		data: {
			fighted: false
		}
	});
	await prisma.dojo.update({
		where: {
			id: dojoId
		},
		data: {
			dailyReset: { increment: 1 }
		}
	});
	return await prisma.dojoTeam.findMany({
		where: {
			dojoId: dojoId
		},
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
	});
}

export async function createMyDojo(playerId: string) {
	const dojo = await prisma.dojo.create({
		data: {
			player: { connect: { id: playerId } }
		},
		select: {
			DojoChallengeHistory: {
				select: {
					victory: true,
					achieved: true
				}
			},
			id: true,
			playerId: true,
			reputation: true,
			activeChallenge: true
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
			DojoOpponents: {
				select: {
					fighted: true,
					achieved: true,
					dinoz: {
						select: {
							id: true,
							display: true,
							level: true,
							name: true
						}
					}
				}
			},
			reputation: true
		}
	});
	return dojo;
}

export async function addOpponent(dinozId: number, dojoId: string) {
	return await prisma.dojoOpponents.create({
		data: {
			dinoz: { connect: { id: dinozId } },
			dojo: { connect: { id: dojoId } }
		},
		select: {
			dinoz: {
				select: {
					id: true,
					name: true,
					level: true,
					display: true
				}
			},
			fighted: true,
			achieved: true
		}
	});
}
export async function getChallengeRequest(playerId: string) {
	const today = new Date();
	const challenge = await prisma.dojo.findUnique({
		where: { playerId },
		select: {
			DojoChallengeHistory: {
				where: {
					archivedAt: today
				}
			},
			team: true,
			teamUpdate: true,
			DojoOpponents: true,
			activeChallenge: true
		}
	});
	return challenge;
}

export async function createChallengeRequest(playerId: string, activeChallenge: string) {
	const challenge = await prisma.dojo.update({
		where: { playerId },
		data: {
			activeChallenge: activeChallenge
		}
	});

	return challenge;
}

export async function setFightedTeam(dinozId: number, dojoId: string) {
	await prisma.dojoTeam.update({
		where: {
			dojoId_dinozId: {
				dojoId: dojoId,
				dinozId: dinozId
			}
		},
		data: {
			fighted: true
		}
	});
}

export async function setFightedOpponent(dinozId: number, dojoId: string, challengeWon: boolean) {
	await prisma.dojoOpponents.update({
		where: {
			dojoId_dinozId: {
				dinozId: dinozId,
				dojoId: dojoId
			}
		},
		data: {
			fighted: true,
			achieved: challengeWon
		}
	});
}

export async function giveReputation(quantity: number, dojoId: string) {
	await prisma.dojo.update({
		where: {
			id: dojoId
		},
		data: {
			reputation: { increment: quantity }
		}
	});
}

/*
export async function setFightedOpponent(dinozId: number, dojoId: string) {
	return await prisma.dojoOpponents.update({
		where: {
			dinozId: dinozId,
			id: dojoId
		},
		data: {
			fighted: true
		}
	});
}*/
