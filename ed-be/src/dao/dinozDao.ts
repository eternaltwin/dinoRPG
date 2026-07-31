import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Dinoz, LogType, Prisma, UnavailableReason } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { createLog, createLogForMultipleDinoz } from './logDao.js';
import TournamentManager from '../utils/tournamentManager.js';
import { GLOBAL } from '../context.js';
import { withSpan } from '../utils/server/tracing.js';
import { getActiveTeamsCached } from '../utils/tournament.cache.js';

// Getters

export async function getRandomDinozFromLevel(level: number, team: number[], playerId: string) {
	return withSpan('DinozDao.getRandomDinozFromLevel', async () => {
		let leveldifference = 1;
		const MAX_LEVEL_DIFFERENCE = 5;
		while (leveldifference <= MAX_LEVEL_DIFFERENCE) {
			const condition = {
				AND: [
					{ level: { gte: level - leveldifference, lte: level + leveldifference } },
					{ id: { not: { in: team } } },
					{ playerId: { not: playerId } }
				]
			};
			const count = await prisma.dinoz.count({
				where: condition
			});

			if (count > 0) {
				const random = Math.floor(Math.random() * count);
				return await prisma.dinoz.findFirstOrThrow({
					skip: random,
					where: condition,
					select: {
						id: true,
						display: true,
						name: true,
						level: true
					}
				});
			}

			leveldifference += 1;
		}

		return null;
	});
}

export async function getActiveDinoz(playerId: string) {
	return withSpan(getActiveDinoz.name, async () => {
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
	});
}

export async function getDinozForAnnounce(dinozId: number) {
	return withSpan(getDinozForAnnounce.name, async () => {
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
				name: true,
				display: true
			}
		});
	});
}

export async function getDinozItinerantShop(dinozId: number, playerId: string) {
	return withSpan(getDinozItinerantShop.name, async () => {
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
				ranking: { select: { dinozCount: true, points: true } },
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
	});
}

export async function getAllDinozFromAccount(playerId: string) {
	return withSpan(getAllDinozFromAccount.name, async () => {
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
				nbrUpFire: true,
				nbrUpWood: true,
				nbrUpWater: true,
				nbrUpLightning: true,
				nbrUpAir: true,
				status: true,
				skills: true,
				unlockableSkills: true
			}
		});

		return dinozList;
	});
}

export async function getAllDinozFicheLite(playerId: string) {
	return withSpan(getAllDinozFicheLite.name, async () => {
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
	});
}

export async function getCanDinozChangeName(dinozId: number) {
	return withSpan(getCanDinozChangeName.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				canChangeName: true,
				player: { select: { id: true } }
			}
		});

		return dinoz;
	});
}

export async function getDinozPlace(dinozId: number) {
	return withSpan(getDinozPlace.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				placeId: true
			}
		});
		return dinoz;
	});
}

export async function isDinozInTournament(dinozId: number) {
	return withSpan(isDinozInTournament.name, async () => {
		let tournament = await getActiveTeamsCached(prisma);
		if (!tournament) {
			const testTournament = await TournamentManager.getActiveTeams(prisma);
			if (!testTournament) {
				return false;
			} else {
				tournament = testTournament;
			}
		}

		const dinoz = await prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				TournamentTeam: {
					where: { tournamentId: tournament.id },
					select: { id: true }
				}
			}
		});

		if (!dinoz?.TournamentTeam.length) return false;

		const dinozTeamId = dinoz.TournamentTeam[0].id;
		return tournament.winners.some(t => t.tournamentTeamId === dinozTeamId);
	});
}

export async function tournamentDinoz(dinozId: number) {
	return withSpan(tournamentDinoz.name, async () => {
		const dinoz = await prisma.gameDinoz.findFirstOrThrow({
			where: {
				id: dinozId
			},
			select: {
				level: true,
				FBTournament: {
					select: {
						levelLimit: true
					}
				}
			}
		});
		return dinoz;
	});
}

export async function isDinozSelling(dinozId: number, playerId: string) {
	return withSpan(isDinozSelling.name, async () => {
		const dinoz = await prisma.offer.findMany({
			where: { sellerId: playerId },
			select: {
				status: true,
				dinozId: true
			}
		});
		return dinoz?.some(t => t.dinozId === dinozId && t.status !== 'CLAIMED');
	});
}

export async function getDinozFicheRequest(dinozId: number, playerId: string) {
	return withSpan('dinozDao.getDinozFicheRequest', async () => {
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
				ranking: { select: { dinozCount: true, points: true } },
				ingredients: { select: { ingredientId: true, quantity: true } },
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
						unavailableUntil: true,
						fight: true,
						gather: true,
						remaining: true,
						order: true,
						canChangeName: true,
						items: { select: { itemId: true } },
						status: { select: { statusId: true } },
						missions: true,
						skills: { select: { skillId: true, state: true } },
						followers: { select: { id: true, fight: true, remaining: true, gather: true, name: true } },
						concentration: true,
						TournamentTeam: { select: { tournamentId: true } },
						build: true
					},
					where: {
						OR: [{ id: dinozId }, { leaderId: dinozId }]
					}
				},
				clan: {
					select: {
						id: true,
						castle: {
							select: {
								placeId: true,
								defender: {
									select: {
										id: true
									}
								}
							}
						},
						attackingWars: {
							where: {
								winnerClanId: null // uniquement la guerre active
							},
							take: 1,
							select: {
								id: true,
								defender: {
									select: {
										id: true,
										castle: {
											select: {
												placeId: true
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});

		return player;
	});
}

export type PlayerWithMissionData = NonNullable<Awaited<ReturnType<typeof getDinozMissionsInfo>>>;
export async function getDinozMissionsInfo(dinozId: number, playerId: string) {
	return withSpan(getDinozMissionsInfo.name, async () => {
		const player = await prisma.player.findUnique({
			where: { id: playerId },
			select: {
				id: true,
				money: true,
				items: { select: { itemId: true, quantity: true } },
				rewards: { select: { rewardId: true } },
				quests: { select: { questId: true, progression: true } },
				ranking: { select: { dinozCount: true, points: true } },
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

		return player;
	});
}

/**
 * Returns the list of Dinoz and their places for a given player
 * @param playerId Id of the player
 * @returns List of Dinoz with their places
 */
export async function getDinozPlaces(playerId: string) {
	return withSpan(getDinozPlaces.name, async () => {
		const player = await prisma.player.findUnique({
			where: { id: playerId },
			select: {
				id: true,
				dinoz: {
					select: {
						id: true,
						placeId: true
					}
				}
			}
		});

		return player;
	});
}

export async function getDinozConcentrationRequest(dinozId: number) {
	return withSpan(getDinozConcentrationRequest.name, async () => {
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
	});
}

export async function getDinozFicheLiteRequest(dinozId: number) {
	return withSpan(getDinozFicheLiteRequest.name, async () => {
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
	});
}

export async function getDinozFicheItemRequest(dinozId: number) {
	return withSpan(getDinozFicheItemRequest.name, async () => {
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
				raceId: true,
				player: {
					select: {
						id: true,
						money: true,
						cooker: true,
						lang: true,
						shopKeeper: true,
						items: {
							select: { id: true, itemId: true, quantity: true }
						},
						quests: { select: { questId: true, progression: true } }
					}
				},
				status: { select: { statusId: true } },
				skills: { select: { skillId: true } },
				unlockableSkills: { select: { skillId: true } }
			}
		});

		return dinoz;
	});
}

export async function getDinozEquipItemRequest(dinozId: number) {
	return withSpan(getDinozEquipItemRequest.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				player: {
					select: {
						id: true,
						engineer: true,
						shopKeeper: true,
						items: {
							select: { id: true, itemId: true, quantity: true }
						},
						rewards: true
					}
				},
				items: { select: { id: true, itemId: true } },
				status: { select: { statusId: true } },
				skills: { select: { skillId: true } },
				unavailableReason: true
			}
		});

		return dinoz;
	});
}

export async function getDinozFightDataRequest(dinozId: number, playerId: string) {
	return withSpan(getDinozFightDataRequest.name, async () => {
		const player = await prisma.player.findUnique({
			where: { id: playerId },
			select: {
				id: true,
				money: true,
				items: { select: { itemId: true, quantity: true } },
				rewards: { select: { rewardId: true } },
				quests: { select: { questId: true, progression: true } },
				ranking: { select: { dinozCount: true, points: true } },
				ingredients: { select: { ingredientId: true, quantity: true } },
				teacher: true,
				cooker: true,
				autoReequipItems: true,
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

		return player;
	});
}

export type selectDinozForDojoFight = Awaited<ReturnType<typeof getDinozForDojoFight>>;
export async function getDinozForDojoFight(dinozIds: number[]) {
	return withSpan(getDinozForDojoFight.name, async () => {
		const dinoz = await prisma.dinoz.findMany({
			where: { id: { in: dinozIds } },
			select: {
				id: true,
				playerId: true,
				display: true,
				name: true,
				level: true,
				life: true,
				maxLife: true,
				nbrUpFire: true,
				nbrUpWood: true,
				nbrUpWater: true,
				nbrUpLightning: true,
				nbrUpAir: true,
				skills: {
					select: { skillId: true },
					where: { state: { equals: true } }
				},
				items: {
					select: {
						itemId: true
					}
				},
				status: {
					select: {
						statusId: true
					}
				},
				catches: { select: { id: true, hp: true, monsterId: true } }
			}
		});
		return dinoz;
	});
}

export async function getDinozNPCRequest(dinozId: number, playerId: string) {
	return withSpan(getDinozNPCRequest.name, async () => {
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
				quests: true,
				ranking: true
			}
		});

		return player;
	});
}

export async function getDinozFightClanDataRequest(dinozId: number, playerId: string) {
	return withSpan(getDinozFightClanDataRequest.name, async () => {
		const player = await prisma.player.findUnique({
			where: { id: playerId },
			select: {
				id: true,
				money: true,
				items: { select: { itemId: true, quantity: true } },
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
						fight: true,
						items: { select: { itemId: true } },
						skills: {
							select: { skillId: true },
							where: { state: { equals: true } }
						},
						status: { select: { statusId: true } },
						catches: { select: { id: true, hp: true, monsterId: true } }
					},
					where: {
						OR: [{ id: dinozId }, { leaderId: dinozId }]
					}
				}
			}
		});

		return player;
	});
}

export async function getDinozSkillRequest(dinozId: number) {
	return withSpan(getDinozSkillRequest.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				player: { select: { id: true } },
				skills: { select: { skillId: true, state: true } }
			}
		});

		return dinoz;
	});
}

export async function getDinozSkillAndStatusRequest(dinozId: number) {
	return withSpan(getDinozSkillAndStatusRequest.name, async () => {
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
	});
}

export async function getDinozForLevelUp(dinozId: number) {
	return withSpan(getDinozForLevelUp.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				placeId: true,
				maxLife: true,
				raceId: true,
				name: true,
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
				unavailableReason: true,
				seed: true,
				player: {
					select: {
						id: true,
						discoveredSkills: true,
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
	});
}

export async function getDinozInfoForAdmin(dinozId: number) {
	return withSpan(getDinozInfoForAdmin.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				maxLife: true,
				raceId: true,
				name: true,
				display: true,
				experience: true,
				level: true,
				nbrUpFire: true,
				nbrUpWood: true,
				nbrUpWater: true,
				nbrUpLightning: true,
				nbrUpAir: true,
				canChangeName: true,
				unavailableReason: true,
				items: { select: { itemId: true } },
				skills: { select: { skillId: true } },
				unlockableSkills: { select: { skillId: true } },
				status: { select: { statusId: true } }
			}
		});

		return dinoz;
	});
}

export async function getEventDinozForLevelUp(dinozId: number) {
	return withSpan(getEventDinozForLevelUp.name, async () => {
		const dinoz = await prisma.gameDinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				name: true,
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
						discoveredSkills: true,
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
	});
}

export async function getDinozForSkillEffect(dinozId: number) {
	return withSpan(getDinozForSkillEffect.name, async () => {
		const dinoz = await prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				maxLife: true,
				nbrUpFire: true,
				nbrUpWood: true,
				nbrUpWater: true,
				nbrUpLightning: true,
				nbrUpAir: true
			}
		});

		return dinoz;
	});
}

export async function getDinozSkillsLearnableAndUnlockable(dinozId: number) {
	return withSpan(getDinozSkillsLearnableAndUnlockable.name, async () => {
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
	});
}

export async function getDinozTotalCount() {
	return withSpan(getDinozTotalCount.name, async () => {
		return prisma.dinoz.count();
	});
}

export async function getDinozGatherData(dinozId: number, playerId: string) {
	return withSpan(getDinozGatherData.name, async () => {
		const player = await prisma.player.findUnique({
			where: { id: playerId },
			select: {
				id: true,
				money: true,
				dailyGridRewards: true,
				shopKeeper: true,
				items: { select: { id: true, itemId: true, quantity: true } },
				rewards: { select: { rewardId: true } },
				ingredients: true,
				quests: { select: { questId: true, progression: true } },
				ranking: { select: { dinozCount: true, points: true } },
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
	});
}

// Setters
export async function createDinoz(dinoz: Prisma.DinozCreateInput) {
	return withSpan(createDinoz.name, async () => {
		if (!dinoz.player?.connect?.id) {
			throw new ExpectedError('Missing player id');
		}

		const newDinoz = await prisma.dinoz.create({
			data: dinoz as Prisma.DinozCreateInput
		});

		await createLog(LogType.CreateDinoz, dinoz.player.connect.id, newDinoz.id);

		GLOBAL.liveStats.incrementDinoz();

		return newDinoz;
	});
}

export async function updateDinoz(dinozId: number, dinoz: Prisma.DinozUpdateInput) {
	return withSpan(updateDinoz.name, async () => {
		await prisma.dinoz.update({
			where: { id: dinozId },
			data: dinoz
		});
	});
}

export async function updateEventDinoz(dinozId: number, dinoz: Prisma.GameDinozUpdateInput) {
	return withSpan(updateEventDinoz.name, async () => {
		await prisma.gameDinoz.update({
			where: { id: dinozId },
			data: dinoz
		});
	});
}

export async function updateMultipleDinoz(dinozIds: number[], dinoz: Prisma.DinozUpdateInput) {
	return withSpan(updateMultipleDinoz.name, async () => {
		await prisma.dinoz.updateMany({
			where: { id: { in: dinozIds } },
			data: dinoz
		});
	});
}

export async function updateMultipleDinozPlaceId(playerId: string, dinoz: Pick<Dinoz, 'id'>[], placeId: number) {
	return withSpan(updateMultipleDinozPlaceId.name, async () => {
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
	});
}

export async function getGlobalMissionsData(playerId: string) {
	return withSpan(getGlobalMissionsData.name, async () => {
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
	});
}

export async function getManageData(userID: string) {
	return withSpan(getManageData.name, async () => {
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
			orderBy: [{ order: 'asc' }, { id: 'asc' }]
		});

		return dinozList;
	});
}

export async function updateOrderData(playerId: string, dinozList: { id: number; order: number }[]) {
	return withSpan(updateOrderData.name, async () => {
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
		return prisma.dinoz.findMany({
			where: {
				playerId,
				OR: [
					{ unavailableReason: null },
					{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
				]
			},
			select: {
				id: true,
				order: true
			},
			orderBy: {
				order: 'asc'
			}
		});
	});
}

export async function getAvailableDinozToFollow(playerId: string, dinozId: number) {
	return withSpan(getAvailableDinozToFollow.name, async () => {
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
				followers: { select: { id: true, fight: true, remaining: true, gather: true, name: true } },
				skills: { select: { skillId: true, state: true } }
			}
		});

		return dinozList;
	});
}

export async function getFollowingDinoz(dinozId: number) {
	return withSpan(getFollowingDinoz.name, async () => {
		return await prisma.dinoz.findUnique({
			where: {
				id: dinozId
			},
			select: {
				id: true,
				followers: { select: { id: true } },
				leaderId: true
			}
		});
	});
}

export async function getLeaderWithFollowers(dinozId: number) {
	return withSpan(getLeaderWithFollowers.name, async () => {
		return await prisma.dinoz.findFirst({
			where: { followers: { some: { id: dinozId } } },
			select: {
				id: true,
				followers: { select: { id: true, skills: true } },
				skills: true
			}
		});
	});
}

export async function getIrmaUsageInfo(dinozId: number) {
	return withSpan(getIrmaUsageInfo.name, async () => {
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
	});
}

export async function checkFrozenDinoz(dinozId: number) {
	return withSpan(checkFrozenDinoz.name, async () => {
		return await prisma.dinoz.findUnique({
			where: {
				id: dinozId
			},
			select: {
				id: true,
				unavailableReason: true,
				followers: true,
				leaderId: true,
				player: true,
				placeId: true
			}
		});
	});
}

export async function checkRestDinoz(dinozId: number) {
	return withSpan(checkRestDinoz.name, async () => {
		return await prisma.dinoz.findUnique({
			where: {
				id: dinozId
			},
			select: {
				id: true,
				unavailableReason: true
			}
		});
	});
}

export async function getAllResting() {
	return withSpan(getAllResting.name, async () => {
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
		// TODO that does take into account skills that increase maximum rest
		return list.filter(d => d.life < Math.round(d.maxLife / 2));
	});
}

export async function getAllUnsacrificing() {
	return withSpan(getAllResting.name, async () => {
		const list = await prisma.dinoz.findMany({
			where: {
				unavailableReason: UnavailableReason.unsacrificing
			},
			select: {
				id: true,
				unavailableUntil: true
			}
		});
		return list;
	});
}

export async function getAllUnavailableUntil() {
	return withSpan(getAllResting.name, async () => {
		const list = await prisma.dinoz.findMany({
			where: {
				NOT: {
					unavailableUntil: null
				}
			},
			select: {
				id: true,
				unavailableUntil: true,
				unavailableReason: true
			}
		});
		return list;
	});
}

export async function getDinozToReincarnate(dinozId: number) {
	return withSpan(getDinozToReincarnate.name, async () => {
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
				items: {
					select: { itemId: true }
				},
				display: true,
				id: true,
				seed: true,
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
	});
}

export async function getDinozUnavailableReason(dinozId: number) {
	return withSpan(getDinozUnavailableReason.name, async () => {
		return await prisma.dinoz.findUnique({
			where: {
				id: dinozId
			},
			select: {
				unavailableReason: true
			}
		});
	});
}
