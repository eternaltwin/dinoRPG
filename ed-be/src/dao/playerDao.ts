import { itemList } from '@drpg/core/models/item/ItemList';
import { LogType, Prisma, UnavailableReason } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { createLog } from './logDao.js';
import { AdminRole } from '@drpg/prisma';

export async function createPlayer(newPlayer: Prisma.PlayerCreateInput) {
	const player = await prisma.player.create({
		data: newPlayer
	});

	return player;
}

//TODO : Check if it work and maybe remove some query because of the Ondelete Cascade enabled (or at least add some await)
export async function resetUser(playerId: number) {
	// Delete all the player's dinoz
	await prisma.dinoz.deleteMany({
		where: {
			playerId
		}
	});

	// Delete player dinoz shop
	await prisma.playerDinozShop.deleteMany({
		where: {
			playerId
		}
	});

	// Delete player ingredients
	await prisma.playerIngredient.deleteMany({
		where: {
			playerId
		}
	});

	// Delete player items
	await prisma.playerItem.deleteMany({
		where: {
			playerId
		}
	});

	// Delete player quests
	await prisma.playerQuest.deleteMany({
		where: {
			playerId
		}
	});

	// Delete player rewards
	await prisma.playerReward.deleteMany({
		where: {
			playerId
		}
	});
}

// Getters

export async function getRolePlayer(role: AdminRole) {
	const players = await prisma.player.findMany({
		where: {
			role: role
		},
		select: {
			id: true,
			eternalTwinId: true
		}
	});
	return players;
}

export async function getPlayerId(eternalTwinId: string) {
	const player = await prisma.player.findFirst({
		where: {
			eternalTwinId
		},
		select: {
			id: true,
			name: true,
			role: true
		}
	});

	return player;
}

export async function getLBPlayer(eternalTwinId: string) {
	const player = await prisma.player.findFirst({
		where: {
			eternalTwinId
		},
		select: {
			id: true,
			name: true,
			lastLogin: true,
			dinoz: {
				select: {
					remaining: true
				},
				where: {
					OR: [
						{ unavailableReason: null },
						{
							unavailableReason: {
								not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed, UnavailableReason.selling] }
							}
						}
					]
				}
			}
		}
	});

	return player;
}

export async function getPlayerUSkills(playerId: number) {
	const player = await prisma.player.findFirst({
		where: {
			id: playerId
		},
		select: {
			id: true,
			leader: true,
			engineer: true,
			cooker: true,
			shopKeeper: true,
			merchant: true,
			priest: true,
			teacher: true,
			messie: true,
			matelasseur: true
		}
	});

	return player;
}

export async function getEternalTwinId(playerId: number) {
	const player = await prisma.player.findFirst({
		where: {
			id: playerId
		},
		select: {
			eternalTwinId: true
		}
	});

	return player;
}

export async function getLBResponseInformation(playerId: number) {
	const player = await prisma.player.findFirst({
		where: {
			id: playerId
		},
		select: {
			eternalTwinId: true,
			labruteDone: true,
			_count: {
				select: {
					dinoz: {
						where: {
							OR: [
								{ unavailableReason: null },
								{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
							]
						}
					}
				}
			}
		}
	});

	return player;
}

export async function getCommonDataRequest(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			name: true,
			money: true,
			engineer: true,
			lastLogin: true,
			dinoz: {
				select: {
					id: true,
					leaderId: true,
					display: true,
					name: true,
					life: true,
					maxLife: true,
					experience: true,
					placeId: true,
					level: true,
					order: true,
					raceId: true,
					unavailableReason: true,
					missions: true,
					nbrUpFire: true,
					nbrUpWood: true,
					nbrUpWater: true,
					nbrUpLightning: true,
					nbrUpAir: true,
					remaining: true,
					fight: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					skills: { select: { skillId: true } },
					followers: { select: { id: true } }
				},
				where: {
					OR: [
						{ unavailableReason: null },
						{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
					]
				},
				orderBy: [{ order: 'asc' }, { name: 'asc' }]
			},
			rewards: true,
			matelasseur: true,
			items: { select: { itemId: true, quantity: true } }
		}
	});

	return player;
}

export async function getAllInformationFromPlayer(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		include: {
			items: true,
			ingredients: true,
			rewards: true
		}
	});

	return player;
}

export async function getImportedData(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			eternalTwinId: true,
			hasImported: true
		}
	});

	return player;
}

export async function getImportedTwinoidData(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			eternalTwinId: true,
			importedTwinoidSite: true
		}
	});

	return player;
}

export async function getPlayerMoney(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			money: true
		}
	});

	return player;
}

export async function getPlayerCompletion(playerId: number) {
	return await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			ranking: {
				select: {
					completion: true
				}
			}
		}
	});
}
export async function getPlayerDataRequest(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			createdDate: true,
			name: true,
			customText: true,
			rewards: { select: { rewardId: true } },
			dinoz: {
				select: {
					id: true,
					display: true,
					name: true,
					level: true,
					raceId: true,
					life: true,
					unavailableReason: true,
					status: { select: { statusId: true } }
				},
				where: {
					OR: [{ unavailableReason: null }, { unavailableReason: { not: UnavailableReason.sacrificed } }]
				},
				orderBy: [
					{
						id: 'asc'
					},
					{
						unavailableReason: 'asc'
					}
				]
			},
			ranking: {
				select: {
					points: true,
					dinozCount: true,
					completion: true
				}
			},
			playerTracking: {
				select: {
					stat: true,
					quantity: true
				}
			}
		}
	});

	return player;
}

export async function prepareConcentration(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			dinoz: {
				select: {
					id: true,
					placeId: true,
					name: true,
					concentration: true,
					status: true
				}
			}
		}
	});

	return player;
}

export async function searchPlayersByName(playerName: string) {
	const players = await prisma.player.findMany({
		where: {
			name: {
				contains: playerName,
				mode: 'insensitive'
			}
		},
		select: {
			id: true,
			name: true,
			eternalTwinId: true
		}
	});

	return players;
}

/**
 * Get all the necessary data from the player for inventoryService getAllItemsData function
 * That includes:  merchant, all its items and their quantity (if above 0)
 * Throws an error if the player does not exist.
 * @return Player
 */
export async function getPlayerInventoryDataRequest(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			shopKeeper: true,
			items: {
				select: {
					itemId: true,
					quantity: true
				},
				where: {
					quantity: {
						gt: 0
					}
				}
			}
		}
	});

	return player;
}

/**
 * Get all the necessary data from the player for dinozShopService getDinozFromDinozShop function
 * That includes:  platerId and its list of dinoz in the shop
 * Throws an error if the player does not exist.
 * @return Player
 */
export async function getPlayerDinozShopRequest(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			dinozShop: {
				select: {
					id: true,
					raceId: true,
					display: true
				}
			},
			rewards: true
		}
	});

	return player;
}

export async function getPlayerRewardsRequest(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			quetzuBought: true,
			rewards: { select: { rewardId: true } }
		}
	});

	return player;
}

export async function getBoxHandlerInformations(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			_count: {
				select: {
					dinoz: {
						where: {
							OR: [
								{ unavailableReason: null },
								{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
							]
						}
					}
				}
			},
			dinoz: {
				select: {
					level: true,
					_count: {
						select: {
							missions: { where: { isFinished: true } }
						}
					}
				},
				where: {
					OR: [
						{ unavailableReason: null },
						{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
					]
				}
			},
			rewards: true
		}
	});

	return player;
}

/**
 * Get all the necessary data from the player for dinozService buyDinoz function
 * That includes:  platerId and the dinoz from the shop that it is trying to buy
 * @return Player
 */
export async function getPlayerSpecificDinozShopRequest(playerId: number, dinozId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			money: true,
			dinozShop: {
				select: {
					id: true,
					raceId: true,
					display: true
				},
				where: {
					id: dinozId
				}
			}
		}
	});

	return player;
}

/**
 * Get all the necessary data from the player for itemShopService getItemsFromShop function
 * That includes: money, shopKeeper, merchant, all its dinoz that are not frozen or sacrificed and their placeId,
 * all its items and their quantity
 * Throws an error if the player does not exist.
 * @return Player
 */
export async function getPlayerShopItemsDataRequest(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			money: true,
			merchant: true,
			shopKeeper: true,
			items: {
				select: {
					itemId: true,
					quantity: true
				}
			},
			dinoz: {
				select: {
					placeId: true,
					status: { select: { statusId: true } }
				},
				where: {
					OR: [
						{ unavailableReason: null },
						{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
					]
				}
			}
		}
	});

	return player;
}

/**
 * Get all the necessary data from the player for itemShopService buyItem function
 * That includes: money, shopKeeper, merchant, all its dinoz that are not frozen or sacrificed and their placeId,
 * its items and its quantity, finally the number of owned golden napodinos
 * Throws an error if the player does not exist.
 * @return Player
 */
export async function getPlayerShopOneItemDataRequest(playerId: number, itemId: number) {
	const player = await prisma.player.findUniqueOrThrow({
		where: {
			id: playerId
		},
		select: {
			id: true,
			money: true,
			merchant: true,
			shopKeeper: true,
			items: {
				select: {
					id: true,
					itemId: true,
					quantity: true
				},
				where: {
					itemId: { in: [itemId, itemList.GOLDEN_NAPODINO.itemId] }
				}
			},
			dinoz: {
				select: {
					placeId: true,
					status: { select: { statusId: true } }
				},
				where: {
					OR: [
						{ unavailableReason: null },
						{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
					]
				}
			}
		}
	});

	return player;
}

/**
 * Get all the necessary data from the player for itinerantShopService getIngredientsFromShop function
 * That includes: money, merchant, all its dinoz that are not frozen or sacrificed and their placeId,
 * all its ingredients and their quantity
 * Throws an error if the player does not exist.
 * @return Player
 */
export async function getPlayerShopIngredientsDataRequest(playerId: number) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			money: true,
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				}
			},
			dinoz: {
				select: {
					placeId: true,
					status: { select: { statusId: true } }
				},
				where: {
					OR: [
						{ unavailableReason: null },
						{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
					]
				}
			}
		}
	});

	return player;
}

// Setters
//TODO
export async function addMoney(playerId: number, money: number) {
	const playerData = await prisma.player.update({
		where: {
			id: playerId
		},
		data: {
			money: {
				increment: money
			}
		},
		select: { money: true }
	});

	await createLog(LogType.GoldWon, playerId, undefined, money.toString());

	return playerData;
}

export async function removeMoney(playerId: number, money: number) {
	const playerData = await prisma.player.update({
		where: {
			id: playerId
		},
		data: {
			money: {
				decrement: money
			}
		},
		select: { money: true }
	});

	await createLog(LogType.GoldLost, playerId, undefined, money.toString());

	return playerData;
}

export async function setPlayer(playerId: number, player: Prisma.PlayerUpdateInput) {
	const playerData = await prisma.player.update({
		where: {
			id: playerId
		},
		data: player
	});

	return playerData;
}

export async function ownsDinoz(playerId: number, ...dinozIds: number[]) {
	const player = await prisma.player.count({
		where: {
			id: playerId,
			AND: dinozIds.map(dinozId => ({
				dinoz: {
					some: {
						id: dinozId
					}
				}
			}))
		}
	});

	return player > 0;
}

export async function archiveOldUsername(playerId: number, username: string) {
	await prisma.usernameHistory.create({
		data: {
			playerId: playerId,
			username: username
		}
	});
}
