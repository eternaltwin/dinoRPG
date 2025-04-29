import { CLAN_CREATE_MONEY, CLAN_CREATE_RANKING_POINTS, CLAN_JOIN_MONEY } from '@drpg/core/constants';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { isUuid } from '@drpg/core/utils/isUuid';
import { AdminRole, Lang, LogType, OfferStatus, Prisma, UnavailableReason } from '@drpg/prisma';
import type { Request } from 'express';
import { prisma } from '../prisma.js';
import { createLog } from './logDao.js';

export async function createPlayer(newPlayer: Prisma.PlayerCreateInput) {
	const player = await prisma.player.create({
		data: newPlayer,
		select: {
			id: true,
			name: true,
			connexionToken: true,
			money: true,
			lang: true,
			engineer: true,
			priest: true,
			shopKeeper: true,
			lastLogin: true,
			ips: true,
			skipFight: true,
			skipLevel: true,
			ClanMember: { select: { clanId: true } },
			notifications: {
				select: { id: true, message: true, severity: true, link: true, date: true },
				where: { read: false }
			},
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
					gather: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					skills: { select: { skillId: true } },
					followers: { select: { id: true, fight: true, remaining: true } },
					TournamentTeam: { select: { tournamentId: true } },
					concentration: true
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
			items: { select: { itemId: true, quantity: true } },
			quests: { select: { questId: true, progression: true } },
			ranking: { select: { dinozCount: true } },
			role: true
		}
	});

	return player;
}

export async function getToolTipInfos(playerId: string) {
	return await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			name: true,
			customText: true
		}
	});
}

export async function auth(request: Request, banByPass = false) {
	const {
		headers: { authorization }
	} = request;

	if (!authorization) {
		throw new ExpectedError('You are not logged in');
	}
	if (typeof authorization !== 'string') {
		throw new ExpectedError('Invalid authorization header');
	}

	const [id, token] = Buffer.from(authorization.split(' ')[1] || '', 'base64')
		.toString()
		.split(':');

	if (!id || !token || id === 'null' || token === 'null') {
		throw new ExpectedError('Invalid authorization header content');
	}

	if (!isUuid(id)) {
		throw new ExpectedError('Invalid user ID');
	}

	const user = await prisma.player.findFirst({
		where: {
			id
		},
		select: {
			id: true,
			lang: true,
			banCase: true
		}
	});

	if (!user) {
		throw new ExpectedError('User not found');
	}

	if (user.banCase && !banByPass) {
		throw new ExpectedError('Action forbidden: you have been banned');
	}

	return user;
}

//TODO : Check if it work and maybe remove some query because of the Ondelete Cascade enabled (or at least add some await)
export async function resetUser(playerId: string) {
	await prisma.player.delete({
		where: {
			id: playerId
		}
	});
}

export async function getPlayerInfoToReport(playerId: string) {
	return await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			name: true,
			id: true,
			customText: true,
			dinoz: {
				select: {
					name: true,
					id: true
				}
			}
		}
	});
}
export async function checkBeforeDeletion(playerId: string) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			offers: true,
			bids: {
				where: {
					offer: {
						status: {
							equals: OfferStatus.ONGOING
						}
					}
				}
			},
			ClanMember: true,
			targetedCases: true
		}
	});
	return player;
}
// Getters

export async function getRolePlayer(role: AdminRole) {
	const players = await prisma.player.findMany({
		where: {
			role: role
		},
		select: {
			id: true
		}
	});
	return players;
}

export async function getPlayerId(eternalTwinId: string) {
	const player = await prisma.player.findFirst({
		where: {
			id: eternalTwinId
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
			id: eternalTwinId
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

export async function getPlayerUSkills(playerId: string) {
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

export async function getPlayerForAnnounce(playerId: string) {
	return await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			name: true,
			id: true,
			rewards: {
				select: {
					rewardId: true
				}
			}
		}
	});
}
export async function getEternalTwinId(playerId: string) {
	const player = await prisma.player.findFirst({
		where: {
			id: playerId
		},
		select: {
			id: true
		}
	});

	return player;
}

export async function getLBResponseInformation(playerId: string) {
	const player = await prisma.player.findFirst({
		where: {
			id: playerId
		},
		select: {
			id: true,
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

export async function getCommonDataRequest(playerId: string) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			connexionToken: true,
			name: true,
			money: true,
			lang: true,
			engineer: true,
			priest: true,
			shopKeeper: true,
			lastLogin: true,
			ips: true,
			skipFight: true,
			skipLevel: true,
			ClanMember: { select: { clanId: true } },
			notifications: {
				select: { id: true, message: true, severity: true, link: true, date: true },
				where: { read: false }
			},
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
					gather: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					skills: { select: { skillId: true } },
					followers: { select: { id: true, fight: true, remaining: true } },
					TournamentTeam: { select: { tournamentId: true } },
					concentration: true
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
			items: { select: { itemId: true, quantity: true } },
			quests: { select: { questId: true, progression: true } },
			ranking: { select: { dinozCount: true } },
			role: true
		}
	});

	return player;
}

export async function getPlayerDinozInformationForTeam(playerId: string) {
	const player = await prisma.player.findUniqueOrThrow({
		where: {
			id: playerId
		},
		select: {
			dinoz: {
				where: {
					OR: [
						{ unavailableReason: null },
						{
							unavailableReason: {
								not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed, UnavailableReason.selling] }
							}
						}
					]
				},
				select: {
					id: true,
					level: true,
					raceId: true
				}
			},
			Dojo: {
				select: {
					id: true
				}
			}
		}
	});
	return player;
}

export async function getAllInformationFromPlayer(playerId: string) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		include: {
			banCase: true,
			items: true,
			ingredients: true,
			rewards: true,
			quests: true
		}
	});

	return player;
}

export async function getPlayerMoney(playerId: string) {
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

export async function getPlayerCompletion(playerId: string) {
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
export async function getPlayerDataRequest(playerId: string) {
	const player = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			createdDate: true,
			id: true,
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
			},
			ClanMember: {
				select: {
					clan: {
						select: {
							id: true,
							name: true
						}
					}
				}
			}
		}
	});

	return player;
}

export async function prepareConcentration(playerId: string) {
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
			name: true
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
export async function getPlayerInventoryDataRequest(playerId: string) {
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
			},
			quests: {
				select: {
					questId: true,
					progression: true
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
export async function getPlayerDinozShopRequest(playerId: string) {
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

export async function getPlayerRewardsRequest(playerId: string) {
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

export async function getBoxHandlerInformations(playerId: string) {
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
			rewards: true,
			cooker: true,
			engineer: true,
			leader: true,
			matelasseur: true,
			merchant: true,
			messie: true,
			teacher: true,
			priest: true,
			shopKeeper: true
		}
	});

	return player;
}

/**
 * Get all the necessary data from the player for dinozService buyDinoz function
 * That includes:  platerId and the dinoz from the shop that it is trying to buy
 * @return Player
 */
export async function getPlayerSpecificDinozShopRequest(playerId: string, dinozId: number) {
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
export async function getPlayerShopItemsDataRequest(playerId: string) {
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

/**
 * Get all the necessary data from the player for itemShopService buyItem function
 * That includes: money, shopKeeper, merchant, all its dinoz that are not frozen or sacrificed and their placeId,
 * its items and its quantity, finally the number of owned golden napodinos
 * Throws an error if the player does not exist.
 * @return Player
 */
export async function getPlayerShopOneItemDataRequest(playerId: string, itemId: number) {
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
					itemId: { in: [itemId, itemList[Item.GOLDEN_NAPODINO].itemId, itemList[Item.TREASURE_COUPON].itemId] }
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
			},
			quests: {
				select: {
					questId: true,
					progression: true
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
export async function getPlayerShopIngredientsDataRequest(playerId: string) {
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
export async function addMoney(playerId: string, money: number) {
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

	await createLog(LogType.GoldWon, playerId, undefined, money.toString(), playerData.money.toString());

	return playerData;
}

export async function removeMoney(playerId: string, money: number) {
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

	await createLog(LogType.GoldLost, playerId, undefined, money.toString(), playerData.money.toString());

	return playerData;
}

export async function removeDailyGridRewards(playerId: string, rewards: number) {
	const playerData = await prisma.player.update({
		where: {
			id: playerId
		},
		data: {
			dailyGridRewards: {
				decrement: rewards
			}
		},
		select: { dailyGridRewards: true }
	});

	return playerData;
}

export async function setPlayer(playerId: string, player: Prisma.PlayerUpdateInput) {
	const playerData = await prisma.player.update({
		where: {
			id: playerId
		},
		data: player
	});

	return playerData;
}

export async function ownsDinoz(playerId: string, ...dinozIds: number[]) {
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

export async function archiveOldUsername(playerId: string, username: string) {
	await prisma.usernameHistory.create({
		data: {
			playerId: playerId,
			username: username
		}
	});
}

export async function getDojoFightPreparationRequest(playerId: string) {
	const player = await prisma.player.findUniqueOrThrow({
		where: {
			id: playerId
		},
		select: {
			money: true,
			cooker: true,
			dinoz: {
				select: {
					id: true,
					unavailableReason: true
				}
			}
		}
	});
	return player;
}

export async function getDojoChallengePreparationRequest(playerId: string) {
	const player = await prisma.player.findUniqueOrThrow({
		where: {
			id: playerId
		},
		select: {
			money: true,
			dinoz: {
				select: {
					id: true,
					unavailableReason: true
				}
			},
			Dojo: {
				select: {
					id: true,
					activeChallenge: true,
					team: {
						select: {
							dinozId: true,
							fighted: true
						}
					},
					DojoOpponents: {
						select: {
							dinozId: true,
							fighted: true,
							achieved: true
						}
					}
				}
			}
		}
	});
	return player;
}

export async function getDojoDataForRanking(playerId: string) {
	return await prisma.dojo.findFirstOrThrow({
		where: {
			playerId
		},
		select: {
			reputation: true,
			DojoChallengeHistory: true
		}
	});
}

export async function increaseCashPrice(tournamentId: string, value: number) {
	return await prisma.tournament.update({
		where: {
			id: tournamentId
		},
		data: {
			cashPrice: {
				increment: value
			}
		}
	});
}

export async function getCanCreateClanRequest(playerId: string) {
	const player = await prisma.player.count({
		where: {
			id: playerId,
			money: {
				gte: CLAN_CREATE_MONEY
			},
			ranking: {
				points: {
					gte: CLAN_CREATE_RANKING_POINTS
				}
			},
			ClanMember: null
		}
	});

	return player > 0;
}

export async function getCanJoinClanRequest(playerId: string) {
	const player = await prisma.player.count({
		where: {
			id: playerId,
			money: {
				gte: CLAN_JOIN_MONEY
			},
			ClanJoinRequest: null,
			ClanMember: null
		}
	});

	return player > 0;
}

export async function isPlayerLeaderOfClanRequest(playerId: string, clanId: number) {
	const player = await prisma.clan.count({
		where: {
			id: clanId,
			leaderId: playerId
		}
	});

	return player > 0;
}

export async function getClanIdAndNameFromPlayerId(playerId: string) {
	return await prisma.player.findUniqueOrThrow({
		select: {
			ClanMember: {
				select: {
					clan: {
						select: {
							id: true,
							name: true
						}
					}
				}
			}
		},
		where: {
			id: playerId
		}
	});
}

export async function getPlayerBanInfo(playerId: string) {
	return await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			name: true,
			banCase: true
		}
	});
}

export async function getAllBannedPlayers() {
	return await prisma.player.findMany({
		where: {
			NOT: {
				banCase: null
			}
		},
		select: {
			id: true,
			name: true,
			banCase: {
				select: {
					id: true,
					sorted: true,
					banDate: true,
					banEndDate: true
				}
			}
		}
	});
}

export async function getBannedPlayers(page: number) {
	const skip = (page - 1) * 20;
	const take = 20;

	return await prisma.player.findMany({
		skip: skip,
		take: take,
		orderBy: {
			banCase: {
				banDate: 'desc'
			}
		},
		where: {
			NOT: {
				banCase: null
			}
		},
		select: {
			id: true,
			name: true,
			banCase: {
				select: {
					id: true,
					reason: true,
					sorted: true,
					banDate: true,
					banEndDate: true
				}
			}
		}
	});
}

/**
 * Update the language of a player.
 * @param playerId - The ID of the player.
 * @param language - The new language to set (default is Lang.FR).
 * @returns Updated player language.
 */
export async function updatePlayerLanguage(playerId: string, language: Lang) {
	const updatedPlayer = await prisma.player.update({
		where: {
			id: playerId
		},
		data: {
			lang: language
		}
	});

	return updatedPlayer;
}
