import { CLAN_CREATE_MONEY, CLAN_CREATE_RANKING_POINTS, CLAN_JOIN_MONEY } from '@drpg/core/constants';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { currentEvents, GameEvent } from '@drpg/core/models/event/Events';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { isUuid } from '@drpg/core/utils/isUuid';
import { VERSION } from '@drpg/core/version';
import { AdminRole, Lang, LogType, OfferStatus, Prisma, UnavailableReason } from '@drpg/prisma';
import dayjs from 'dayjs';
import type { Request } from 'express';
import gameConfig from '../config/game.config.js';
import { GLOBAL, LOGGER } from '../context.js';
import { prisma } from '../prisma.js';
import { calculatePlayerCompletion } from '../utils/boxesLogic.js';
import { updateDinoz } from './dinozDao.js';
import { createLog } from './logDao.js';
import { increaseItemQuantity } from './playerItemDao.js';
import { updateCompletion } from './rankingDao.js';
import { setSpecificStat } from './trackingDao.js';

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
			discoveredSkills: true,
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
					followers: { select: { id: true, fight: true, remaining: true, gather: true, name: true } },
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
			ranking: { select: { dinozCount: true, points: true } },
			role: true
		}
	});

	GLOBAL.liveStats.incrementTotalPlayers();

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

export function extractIdFromAuthorization(request: Request) {
	const {
		headers: { authorization }
	} = request;
	if (authorization) {
		const [playerId, token] = Buffer.from(authorization.split(' ')[1] || '', 'base64')
			.toString()
			.split(':');
		return { playerId, token };
	} else {
		return { playerId: undefined, token: undefined };
	}
}

export type Auth = Awaited<ReturnType<typeof auth>>;
export async function auth(request: Request, banByPass = false) {
	const {
		headers: { authorization }
	} = request;

	if (!authorization) {
		throw new ExpectedError('You are not logged in');
	}

	const { playerId, token } = extractIdFromAuthorization(request);

	if (!playerId || !token || playerId === 'null' || token === 'null') {
		throw new ExpectedError('Invalid authorization header content');
	}

	if (!isUuid(playerId)) {
		throw new ExpectedError('Invalid user ID');
	}

	const user = await prisma.player.findFirst({
		where: {
			id: playerId
		},
		select: {
			id: true,
			lang: true,
			banCase: true,
			connexionToken: true,
			name: true,
			lastLogin: true,
			matelasseur: true,
			lastVersionSeen: true
		}
	});

	if (!user) {
		throw new ExpectedError('User not found');
	}

	if (user.connexionToken !== token) {
		throw new ExpectedError('Invalid user token');
	}

	if (user.banCase && !banByPass) {
		throw new ExpectedError('Action forbidden: you have been banned');
	}

	// Check if it's the first login of the day
	if (!dayjs().isSame(user.lastLogin, 'day')) {
		// Add 1 daily ticket
		await increaseItemQuantity(user.id, Item.DAILY_TICKET, 1);

		// Update completion
		const completion = await calculatePlayerCompletion(user.id);
		try {
			await updateCompletion(user.id, completion);
		} catch (e) {
			LOGGER.error(`UpdateCompletion crash with id: ${user.id} and completion score of ${completion}`);
		}

		// Update last login: refresh Labrute flag and daily grid reward limit
		await setPlayer(user.id, {
			lastLogin: new Date(),
			labruteDone: false,
			dailyGridRewards: gameConfig.general.dailyGridRewards
		});

		const playerDinozData = await prisma.dinoz.findMany({
			where: {
				AND: [
					{
						OR: [
							{ unavailableReason: null },
							{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
						]
					},
					{ playerId: user.id }
				]
			},
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

			orderBy: [{ order: 'asc' }, { name: 'asc' }]
		});

		// Tik bracelet regen (& alive)
		const dinozWithTikBracelet = playerDinozData.filter(
			dinoz => dinoz.items.some(item => item.itemId === Item.TIK_BRACELET) && dinoz.life > 0
		);

		for (const dinoz of dinozWithTikBracelet) {
			// Regen 10 HP
			const newHp = Math.min(dinoz.life + 10, dinoz.maxLife);
			await updateDinoz(dinoz.id, { life: newHp });
		}

		if (currentEvents()[0].name === GameEvent.CHRISTMAS) {
			await increaseItemQuantity(user.id, Item.CHRISTMAS_TICKET, 1);
		}

		// Give 2 action for active dinoz
		const leaderWithVeilleuse = playerDinozData.filter(d => d.skills.some(s => s.skillId === Skill.VEILLEUSE));
		for (const dinoz of playerDinozData) {
			let remaning = 2;
			if (user.matelasseur) remaning++;
			if (dinoz.skills.some(s => s.skillId === Skill.GROS_DORMEUR)) remaning++;
			if (leaderWithVeilleuse.some(d => d.followers.some(di => di.id === dinoz.id))) remaning++;
			await updateDinoz(dinoz.id, { remaining: remaning });
		}

		// Update stat
		await setSpecificStat(StatTracking.P_DAYS, user.id, 1);
		await createLog(LogType.PlayerConnected, user.id, undefined, user.name.toString());
	}

	if (user.lastVersionSeen !== VERSION) {
		await prisma.player.update({
			where: {
				id: user.id
			},
			data: {
				lastVersionSeen: VERSION
			}
		});
	}

	return user;
}

// Used for maybe not authenticated endpoints
export async function noStrictAuth(request: Request, banByPass = false) {
	const {
		headers: { authorization }
	} = request;
	if (!authorization) {
		return;
	}
	if (typeof authorization !== 'string') {
		throw new ExpectedError('Invalid authorization header');
	}

	const { playerId, token } = extractIdFromAuthorization(request);

	if (!playerId || !token || playerId === 'null' || token === 'null') {
		throw new ExpectedError('Invalid authorization header content');
	}
	if (!isUuid(playerId)) {
		throw new ExpectedError('Invalid user ID');
	}
	const user = await prisma.player.findFirst({
		where: { id: playerId },
		select: {
			id: true,
			lang: true,
			banCase: true,
			connexionToken: true,
			name: true,
			lastLogin: true,
			matelasseur: true,
			lastVersionSeen: true
		}
	});
	if (!user) {
		throw new ExpectedError('User not found');
	}
	if (user.connexionToken !== token) {
		throw new ExpectedError('Invalid user token');
	}
	if (user.banCase && !banByPass) {
		throw new ExpectedError('Action forbidden: you have been banned');
	} // Check if it's the first login of the day
	if (!dayjs().isSame(user.lastLogin, 'day')) {
		// Add 1 daily ticket
		await increaseItemQuantity(user.id, Item.DAILY_TICKET, 1); // Update completion
		const completion = await calculatePlayerCompletion(user.id);
		try {
			await updateCompletion(user.id, completion);
		} catch (e) {
			LOGGER.error(`UpdateCompletion crash with id: ${user.id} and completion score of ${completion}`);
		} // Update last login: refresh Labrute flag and daily grid reward limit
		await setPlayer(user.id, {
			lastLogin: new Date(),
			labruteDone: false,
			dailyGridRewards: gameConfig.general.dailyGridRewards
		});
		const playerDinozData = await prisma.dinoz.findMany({
			where: {
				AND: [
					{
						OR: [
							{ unavailableReason: null },
							{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
						]
					},
					{ playerId: user.id }
				]
			},
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
			orderBy: [{ order: 'asc' }, { name: 'asc' }]
		}); // Tik bracelet regen (& alive)
		const dinozWithTikBracelet = playerDinozData.filter(
			dinoz => dinoz.items.some(item => item.itemId === Item.TIK_BRACELET) && dinoz.life > 0
		);
		for (const dinoz of dinozWithTikBracelet) {
			// Regen 10 HP
			const newHp = Math.min(dinoz.life + 10, dinoz.maxLife);
			await updateDinoz(dinoz.id, { life: newHp });
		}
		if (currentEvents()[0].name === GameEvent.CHRISTMAS) {
			await increaseItemQuantity(user.id, Item.CHRISTMAS_TICKET, 1);
		} // Give 2 action for active dinoz
		const leaderWithVeilleuse = playerDinozData.filter(d => d.skills.some(s => s.skillId === Skill.VEILLEUSE));
		for (const dinoz of playerDinozData) {
			let remaning = 2;
			if (user.matelasseur) remaning++;
			if (dinoz.skills.some(s => s.skillId === Skill.GROS_DORMEUR)) remaning++;
			if (leaderWithVeilleuse.some(d => d.followers.some(di => di.id === dinoz.id))) remaning++;
			await updateDinoz(dinoz.id, { remaining: remaning });
		} // Update stat
		await setSpecificStat(StatTracking.P_DAYS, user.id, 1);
		await createLog(LogType.PlayerConnected, user.id, undefined, user.name.toString());
	}
	if (user.lastVersionSeen !== VERSION) {
		await prisma.player.update({ where: { id: user.id }, data: { lastVersionSeen: VERSION } });
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
	GLOBAL.liveStats.decrementTotalPlayers();
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
			discoveredSkills: true,
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
					skills: { select: { skillId: true, state: true } },
					followers: { select: { id: true, fight: true, remaining: true, gather: true, name: true } },
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
			ranking: { select: { dinozCount: true, points: true } },
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
								not: {
									in: [
										UnavailableReason.frozen,
										UnavailableReason.sacrificed,
										UnavailableReason.selling,
										UnavailableReason.unfreezing
									]
								}
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
					status: { select: { statusId: true } },
					order: true
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

export async function searchPlayersByNameOrId(search: string) {
	const sanitizedSearch = `%${search.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;

	const players = await prisma.$queryRaw<{ id: string; name: string }[]>`
		SELECT id, name
		FROM "player"
		WHERE name ILIKE ${`%${sanitizedSearch}%`} OR id::text ILIKE ${`%${sanitizedSearch}%`}
		ORDER BY name ASC
		LIMIT 10;
	`;

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

export async function updateUsernameOnRelatedTables(playerId: string, newUsername: string) {
	await Promise.all([
		prisma.pantheon.updateMany({
			data: {
				playerName: newUsername
			},
			where: {
				playerId
			}
		}),
		prisma.clanMessage.updateMany({
			data: {
				authorName: newUsername
			},
			where: {
				authorId: playerId
			}
		}),
		prisma.clanHistory.updateMany({
			data: {
				authorMessage: newUsername
			},
			where: {
				authorId: playerId
			}
		}),
		prisma.conversation.updateMany({
			data: {
				createdByName: newUsername
			},
			where: {
				createdById: playerId
			}
		}),
		prisma.participants.updateMany({
			data: {
				playerName: newUsername
			},
			where: {
				playerId
			}
		}),
		prisma.message.updateMany({
			data: {
				senderName: newUsername
			},
			where: {
				senderId: playerId
			}
		})
	]);
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
					},
					DojoChallengeHistory: {
						select: {
							achieved: true
						},
						where: {
							archivedAt: new Date()
						}
					}
				}
			}
		}
	});
	return player;
}

export async function getDojoDataForRanking(playerId: string) {
	return prisma.dojo.findFirstOrThrow({
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
	return prisma.tournament.update({
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
	return prisma.player.findUniqueOrThrow({
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
	return prisma.player.findUnique({
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
	return prisma.player.findMany({
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

	return prisma.player.findMany({
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

/**
 * Get the player discovered skills.
 * @param playerId - The ID of the player.
 * @returns List of discovered skills.
 */
export async function getPlayerDiscoveredSkills(playerId: string) {
	return prisma.player.findUniqueOrThrow({
		where: {
			id: playerId
		},
		select: {
			discoveredSkills: true
		}
	});
}
