import { Dinoz, LogType, Prisma, UnavailableReason } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { createLog, createLogForMultipleDinoz } from './logDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

// Getters

export async function getActiveDinoz(playerId: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			playerId,
			OR: [
				{ unavailableReason: null },
				{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
			]
		},
		select: {
			unavailableReason: true,
			player: {
				select: {
					id: true,
					leader: true,
					messie: true
				}
			}
		}
	});

	return dinozList;
}

export async function getDinozForAnnounce(dinozId: number) {
	return await prisma.dinoz.findUniqueOrThrow({
		where: {
			id: dinozId
		},
		select: {
			player: {
				select: {
					id: true,
					name: true
				}
			},
			playerId: true,
			id: true,
			level: true,
			raceId: true,
			name: true
		}
	});
}

export async function getDinozItinerantShop(dinozId: number, playerId: number) {
	const player = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			id: true,
			money: true,
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				}
			},
			items: { select: { itemId: true, quantity: true } },
			rewards: { select: { rewardId: true } },
			quests: { select: { questId: true, progression: true } },
			dinoz: {
				select: {
					id: true,
					placeId: true,
					level: true,
					life: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					missions: { select: { missionId: true, isFinished: true } },
					skills: { select: { skillId: true } }
				},
				where: {
					id: dinozId
				}
			}
		}
	});
	return player;
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
			unavailableReason: true,
			level: true,
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
			playerId,
			OR: [{ unavailableReason: null }, { unavailableReason: { not: UnavailableReason.frozen } }]
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
			unavailableReason: true,
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

export async function getDinozPlace(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			placeId: true
		}
	});
	return dinoz;
}

export async function getDinozFicheRequest(dinozId: number, playerId: number) {
	const player = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			id: true,
			money: true,
			engineer: true,
			items: {
				select: { itemId: true, quantity: true }
			},
			quests: { select: { questId: true, progression: true } },
			rewards: { select: { rewardId: true } },
			dinoz: {
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
					leaderId: true,
					unavailableReason: true,
					fight: true,
					gather: true,
					remaining: true,
					order: true,
					canChangeName: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					missions: true,
					skills: { select: { skillId: true } },
					followers: { select: { id: true } },
					concentration: true
				},
				where: {
					OR: [{ id: dinozId }, { leaderId: dinozId }]
				}
			}
		}
	});
	/*const dinoz = await prisma.dinoz.findUnique({
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
			leaderId: true,
			unavailableReason: true,
			fight: true,
			gather: true,
			remaining: true,
			order: true,
			canChangeName: true,
			player: {
				select: {
					id: true,
					money: true,
					engineer: true,
					items: {
						select: { itemId: true, quantity: true }
					},
					rewards: { select: { rewardId: true } },
					dinoz: { select: { leaderId: true } },
					quests: { select: { questId: true, progression: true}}
				}
			},
			items: { select: { itemId: true } },
			status: { select: { statusId: true } },
			missions: true,
			skills: { select: { skillId: true } },
			followers: { select: { id: true } },
			concentration: true
		}
	});*/

	return player;
}

export type PlayerWithMissionData = NonNullable<Awaited<ReturnType<typeof getDinozMissionsInfo>>>;
export async function getDinozMissionsInfo(dinozId: number, playerId: number) {
	const player = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			id: true,
			money: true,
			items: { select: { itemId: true, quantity: true } },
			rewards: { select: { rewardId: true } },
			quests: { select: { questId: true, progression: true } },
			dinoz: {
				select: {
					id: true,
					level: true,
					placeId: true,
					experience: true,
					life: true,
					canChangeName: true,
					items: { select: { itemId: true } },
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
				},
				where: { id: dinozId }
			}
		}
	});
	/*const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			level: true,
			placeId: true,
			experience: true,
			life: true,
			canChangeName: true,
			player: {
				select: {
					id: true,
					money: true,
					items: { select: { itemId: true, quantity: true } },
					rewards: { select: { rewardId: true } }
				}
			},
			items: { select: { itemId: true } },
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
	});*/

	return player;
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
			followers: true,
			placeId: true,
			player: {
				select: {
					id: true,
					quests: { select: { questId: true, progression: true } }
				}
			}
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
			nbrUpWater: true,
			nbrUpWood: true,
			nbrUpAir: true,
			nbrUpLightning: true,
			nbrUpFire: true,
			player: {
				select: {
					id: true,
					money: true,
					cooker: true,
					lang: true,
					items: {
						select: { id: true, itemId: true, quantity: true }
					},
					quests: { select: { questId: true, progression: true } }
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

export async function getDinozFightDataRequest(dinozId: number, playerId: number) {
	const player = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			id: true,
			money: true,
			items: { select: { itemId: true, quantity: true } },
			rewards: { select: { rewardId: true } },
			quests: { select: { questId: true, progression: true } },
			teacher: true,
			cooker: true,
			dinoz: {
				select: {
					id: true,
					display: true,
					playerId: true,
					name: true,
					level: true,
					life: true,
					maxLife: true,
					experience: true,
					nbrUpFire: true,
					nbrUpWood: true,
					unavailableReason: true,
					nbrUpWater: true,
					nbrUpLightning: true,
					nbrUpAir: true,
					placeId: true,
					leaderId: true,
					canChangeName: true,
					fight: true,
					items: { select: { itemId: true } },
					skills: {
						select: { skillId: true },
						where: { state: { equals: true } }
					},
					status: { select: { statusId: true } },
					catches: { select: { id: true, hp: true, monsterId: true } },
					missions: true,
					concentration: true
				},
				where: {
					OR: [{ id: dinozId }, { leaderId: dinozId }]
				}
			}
		}
	});

	/*	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			display: true,
			playerId: true,
			name: true,
			level: true,
			life: true,
			maxLife: true,
			experience: true,
			nbrUpFire: true,
			nbrUpWood: true,
			unavailableReason: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			placeId: true,
			leaderId: true,
			canChangeName: true,
			fight: true,
			player: {
				select: {
					id: true,
					money: true,
					items: { select: { itemId: true, quantity: true } },
					rewards: { select: { rewardId: true } },
					teacher: true
				}
			},
			items: { select: { itemId: true } },
			skills: {
				select: { skillId: true },
				where: { state: { equals: true } }
			},
			status: { select: { statusId: true } },
			catches: { select: { id: true, hp: true, monsterId: true } },
			followers: {
				select: {
					id: true,
					display: true,
					playerId: true,
					name: true,
					level: true,
					placeId: true,
					life: true,
					maxLife: true,
					nbrUpFire: true,
					nbrUpWood: true,
					nbrUpWater: true,
					nbrUpLightning: true,
					nbrUpAir: true,
					experience: true,
					unavailableReason: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					missions: true,
					fight: true,
					skills: {
						select: { skillId: true },
						where: { state: { equals: true } }
					},
					catches: { select: { id: true, hp: true, monsterId: true } }
				}
			},
			missions: true,
			concentration: true
		}
	});*/

	return player;
}

export async function getDinozNPCRequest(dinozId: number, playerId: number) {
	const player = prisma.player.findUnique({
		where: { id: playerId },
		select: {
			dinoz: {
				where: { id: dinozId },
				select: {
					id: true,
					life: true,
					experience: true,
					name: true,
					level: true,
					placeId: true,
					canChangeName: true,
					skills: { select: { skillId: true } },
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					npcs: { select: { npcId: true, step: true } },
					missions: true
				}
			},
			id: true,
			items: true,
			ingredients: true,
			rewards: true,
			quests: true
		}
	});

	return player;
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
			canChangeName: true,
			seed: true,
			player: {
				select: {
					id: true,
					ranking: { select: { points: true, average: true, dinozCount: true } }
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

export async function getDinozGatherData(dinozId: number, playerId: number) {
	const player = await prisma.player.findUnique({
		where: { id: playerId },
		select: {
			id: true,
			money: true,
			items: { select: { id: true, itemId: true, quantity: true } },
			rewards: { select: { rewardId: true } },
			ingredients: true,
			quests: { select: { questId: true, progression: true } },
			dinoz: {
				select: {
					id: true,
					placeId: true,
					level: true,
					life: true,
					items: { select: { itemId: true } },
					gather: true,
					player: {},
					skills: { select: { skillId: true } },
					status: { select: { statusId: true } },
					missions: { select: { missionId: true, isFinished: true } }
				},
				where: { id: dinozId }
			}
		}
	});

	return player;
}

// Setters
//TODO
export async function createDinoz(dinoz: Prisma.DinozCreateInput) {
	if (!dinoz.player?.connect?.id) {
		throw new ExpectedError('Missing player id');
	}

	const newDinoz = await prisma.dinoz.create({
		data: dinoz as Prisma.DinozCreateInput
	});

	await createLog(LogType.CreateDinoz, dinoz.player.connect.id, newDinoz.id);

	return newDinoz;
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

export async function updateMultipleDinozPlaceId(playerId: number, dinoz: Pick<Dinoz, 'id'>[], placeId: number) {
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

	await createLogForMultipleDinoz(
		LogType.Move,
		playerId,
		dinoz.map(d => d.id),
		placeId.toString()
	);
}

export async function getGlobalMissionsData(playerId: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			playerId,
			OR: [{ unavailableReason: null }, { unavailableReason: { not: UnavailableReason.sacrificed } }]
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
			OR: [
				{ unavailableReason: null },
				{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
			]
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

export async function updateOrderData(playerId: number, dinozList: { id: number; order: number }[]) {
	const updates = [];

	for (const dinoz of dinozList) {
		updates.push(
			prisma.dinoz.update({
				where: { id: dinoz.id },
				data: { order: dinoz.order },
				select: { id: true }
			})
		);
	}

	await Promise.all(updates);

	await createLogForMultipleDinoz(
		LogType.ChangeDinozOrder,
		playerId,
		dinozList.map(d => d.id)
	);
}

export async function getAvailableDinozToFollow(playerId: number, dinozId: number) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			id: { not: dinozId },
			playerId: playerId,
			unavailableReason: null
		},
		select: {
			id: true,
			placeId: true,
			leaderId: true,
			unavailableReason: true,
			life: true,
			followers: { select: { id: true } },
			skills: { select: { skillId: true } }
		}
	});

	return dinozList;
}

export async function getFollowingDinoz(dinozId: number) {
	return await prisma.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			id: true,
			followers: { select: { id: true } }
		}
	});
}

export async function getIrmaUsageInfo(dinozId: number) {
	return await prisma.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			id: true,
			remaining: true,
			fight: true,
			gather: true,
			followers: { select: { id: true, remaining: true, fight: true, gather: true } },
			player: {
				select: {
					id: true,
					items: true
				}
			}
		}
	});
}

export async function checkFrozenDinoz(dinozId: number) {
	return await prisma.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			id: true,
			unavailableReason: true,
			followers: true,
			leaderId: true,
			player: true
		}
	});
}

export async function checkRestDinoz(dinozId: number) {
	return await prisma.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			id: true,
			unavailableReason: true
		}
	});
}

export async function getAllResting() {
	const list = await prisma.dinoz.findMany({
		where: {
			unavailableReason: UnavailableReason.resting
		},
		select: {
			id: true,
			life: true,
			maxLife: true,
			skills: true
		}
	});
	return list.filter(d => d.life < Math.round(d.maxLife / 2));
}

export async function getDinozToReincarnate(dinozId: number) {
	return await prisma.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			skills: {
				select: { skillId: true }
			},
			status: {
				select: { statusId: true }
			},
			display: true,
			id: true,
			raceId: true,
			life: true,
			level: true,
			experience: true,
			nbrUpAir: true,
			nbrUpFire: true,
			nbrUpLightning: true,
			nbrUpWater: true,
			nbrUpWood: true
		}
	});
}
