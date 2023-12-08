import { Dinoz, Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

// Getters

export async function getActiveDinoz(playerId: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			playerId,
			isFrozen: false,
			isSacrificed: false
		},
		select: {
			isFrozen: true,
			isSacrificed: true,
			player: {
				select: {
					id: true,
					leader: true
				}
			}
		}
	});

	return dinozList;
}

export async function getAllDinozFromAccount(playerId: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			playerId
		},
		select: {
			id: true,
			leaderId: true,
			name: true,
			isFrozen: true,
			isSacrificed: true,
			level: true,
			missionId: true,
			placeId: true,
			canChangeName: true,
			life: true,
			maxLife: true,
			experience: true,
			status: true,
			skills: true
		}
	});

	return dinozList;
}

export async function getAllDinozFicheLite(playerId: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			playerId
		},
		select: {
			id: true,
			name: true,
			display: true,
			leaderId: true,
			life: true,
			maxLife: true,
			experience: true,
			placeId: true,
			order: true,
			isFrozen: true,
			level: true,
			status: true
		}
	});

	return dinozList;
}

export async function getCanDinozChangeName(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			canChangeName: true,
			player: { select: { id: true } }
		}
	});

	return dinoz;
}

export async function getDinozFicheRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			display: true,
			life: true,
			maxLife: true,
			experience: true,
			nbrUpAir: true,
			nbrUpFire: true,
			nbrUpLightning: true,
			nbrUpWater: true,
			nbrUpWood: true,
			name: true,
			level: true,
			placeId: true,
			raceId: true,
			missionId: true,
			leaderId: true,
			isFrozen: true,
			isSelling: true,
			order: true,
			player: {
				select: {
					id: true,
					money: true,
					engineer: true,
					items: {
						select: { itemId: true, quantity: true }
					},
					rewards: { select: { rewardId: true } },
					dinoz: { select: { leaderId: true } }
				}
			},
			items: { select: { itemId: true } },
			status: { select: { statusId: true } },
			missions: true,
			skills: { select: { skillId: true } },
			followers: { select: { id: true } },
			concentration: true
		}
	});

	return dinoz;
}

export type DinozWithMissionData = NonNullable<Awaited<ReturnType<typeof getDinozMissionsInfo>>>;
export async function getDinozMissionsInfo(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			level: true,
			placeId: true,
			experience: true,
			life: true,
			player: {
				select: {
					id: true,
					money: true,
					items: { select: { itemId: true, quantity: true } },
					rewards: { select: { rewardId: true } }
				}
			},
			status: { select: { statusId: true } },
			skills: { select: { skillId: true } },
			missions: {
				select: {
					missionId: true,
					step: true,
					isFinished: true,
					progress: true
				}
			}
		}
	});

	return dinoz;
}

export async function getDinozConcentrationRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			player: { select: { id: true } },
			concentration: {
				select: {
					id: true,
					dinoz: {
						select: { id: true }
					}
				}
			}
		}
	});

	return dinoz;
}

export async function getDinozFicheLiteRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			life: true,
			experience: true,
			name: true,
			player: { select: { id: true } }
		}
	});

	return dinoz;
}

export async function getDinozFicheItemRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			life: true,
			maxLife: true,
			experience: true,
			name: true,
			level: true,
			placeId: true,
			player: {
				select: {
					id: true,
					money: true,
					items: {
						select: { id: true, itemId: true, quantity: true }
					}
				}
			},
			status: { select: { statusId: true } },
			skills: { select: { skillId: true } }
		}
	});

	return dinoz;
}

export async function getDinozEquipItemRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			player: {
				select: {
					id: true,
					engineer: true,
					items: {
						select: { id: true, itemId: true, quantity: true }
					}
				}
			},
			items: { select: { id: true, itemId: true } },
			status: { select: { statusId: true } },
			skills: { select: { skillId: true } }
		}
	});

	return dinoz;
}

export async function getDinozFightDataRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			name: true,
			level: true,
			life: true,
			maxLife: true,
			experience: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			placeId: true,
			player: {
				select: {
					id: true,
					money: true,
					items: { select: { itemId: true, quantity: true } },
					rewards: { select: { rewardId: true } }
				}
			},
			items: { select: { itemId: true } },
			skills: { select: { skillId: true } },
			status: { select: { statusId: true } },
			followers: {
				select: {
					id: true,
					name: true,
					level: true,
					placeId: true,
					life: true,
					nbrUpFire: true,
					nbrUpWood: true,
					nbrUpWater: true,
					nbrUpLightning: true,
					nbrUpAir: true,
					experience: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					missions: true,
					skills: { select: { skillId: true } }
				}
			},
			missions: true,
			concentration: true
		}
	});

	return dinoz;
}

export async function getDinozNPCRequest(dinozId: number) {
	const dinoz = prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			life: true,
			experience: true,
			name: true,
			level: true,
			placeId: true,
			skills: { select: { skillId: true } },
			items: { select: { itemId: true } },
			status: { select: { statusId: true } },
			npcs: { select: { npcId: true, step: true } },
			missions: true
		}
	});

	return dinoz;
}

export async function getDinozSkillRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			player: { select: { id: true } },
			skills: { select: { skillId: true, state: true } }
		}
	});

	return dinoz;
}

export async function getDinozSkillAndStatusRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			player: { select: { id: true } },
			skills: { select: { skillId: true } },
			status: { select: { statusId: true } }
		}
	});

	return dinoz;
}

export async function getDinozForLevelUp(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			maxLife: true,
			raceId: true,
			display: true,
			experience: true,
			level: true,
			nextUpElementId: true,
			nextUpAltElementId: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			player: {
				select: {
					id: true,
					ranking: { select: { sumPoints: true, averagePoints: true, dinozCount: true } }
				}
			},
			items: { select: { itemId: true } },
			skills: { select: { skillId: true } },
			unlockableSkills: { select: { skillId: true } },
			status: { select: { statusId: true } }
		}
	});

	return dinoz;
}

export async function getDinozSkillsLearnableAndUnlockable(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			raceId: true,
			skills: { select: { skillId: true } },
			unlockableSkills: { select: { skillId: true } },
			status: { select: { statusId: true } }
		}
	});

	return dinoz;
}

export async function getDinozTotalCount() {
	return prisma.dinoz.count();
}

export async function getDinozGatherData(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			placeId: true,
			level: true,
			life: true,
			player: {
				select: {
					id: true,
					money: true,
					items: { select: { id: true, itemId: true, quantity: true } },
					rewards: { select: { rewardId: true } },
					ingredients: true
				}
			},
			skills: { select: { skillId: true } },
			status: { select: { statusId: true } },
			missions: { select: { missionId: true, isFinished: true } }
		}
	});

	return dinoz;
}

// Setters
//TODO
export async function createDinoz(dinoz: Prisma.DinozCreateInput) {
	return prisma.dinoz.create({
		data: dinoz as Prisma.DinozCreateInput
	});
}

export async function updateDinoz(dinozId: number, dinoz: Prisma.DinozUpdateInput) {
	await prisma.dinoz.update({
		where: { id: dinozId },
		data: dinoz
	});
}

export async function updateMultipleDinoz(dinozIds: number[], dinoz: Prisma.DinozUpdateInput) {
	await prisma.dinoz.updateMany({
		where: { id: { in: dinozIds } },
		data: dinoz
	});
}

export async function updateMultipleDinozPlaceId(dinoz: Pick<Dinoz, 'id'>[], placeId: number) {
	await prisma.dinoz.updateMany({
		where: {
			id: {
				in: dinoz.map(d => d.id)
			}
		},
		data: {
			placeId
		}
	});
}

export async function getGlobalMissionsData(playerId: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			playerId,
			isSacrificed: false
		},
		select: {
			id: true,
			name: true,
			display: true,
			missions: {
				select: {
					missionId: true,
					isFinished: true
				}
			}
		}
	});

	return dinozList;
}

export async function getManageData(userID: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			playerId: userID,
			isSacrificed: false,
			isFrozen: false
		},
		select: {
			id: true,
			name: true,
			level: true,
			life: true,
			maxLife: true,
			experience: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			order: true,
			display: true,
			status: { select: { statusId: true } }
		},
		orderBy: [{ order: 'asc' }, { name: 'asc' }]
	});

	return dinozList;
}

export async function updateOrderData(dinozList: { id: number; order: number }[]) {
	const updates = [];

	for (const dinoz of dinozList) {
		updates.push(
			prisma.dinoz.update({
				where: { id: dinoz.id },
				data: { order: dinoz.order }
			})
		);
	}

	await Promise.all(updates);
}

export async function getAvailableDinozToFollow(playerId: number, dinozId: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			id: { not: dinozId },
			playerId: playerId,
			isFrozen: false,
			isSacrificed: false,
			isSelling: false
		},
		select: {
			id: true,
			placeId: true,
			leaderId: true,
			isSelling: true,
			followers: { select: { id: true } },
			skills: { select: { skillId: true } }
		}
	});

	return dinozList;
}
