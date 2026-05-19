import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Clan, ClanMember, ClanWar, LogType, NotificationSeverity, Prisma } from '@drpg/prisma';
import { Request } from 'express';
import { LOGGER } from '../context.js';
import {
	checkCanDeclareWar,
	consumeRepairCost,
	consumeWarCost,
	getWarForResolve,
	playerHasRightRequest
} from '../dao/clansDao.js';
import { createNotification } from '../dao/notificationDao.js';
import { auth } from '../dao/playerDao.js';
import translate from '../utils/translate.js';
import { prisma } from '../prisma.js';
import { ClanEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import dayjs from 'dayjs';
import { ClanHistoryType } from '@drpg/core/models/enums/ClanHistoryType';
import { scheduledJobs, scheduleJob } from 'node-schedule';
import { computeWarPowers } from '../utils/warCalculation.js';
import { getDinozFightClanDataRequest, updateDinoz } from '../dao/dinozDao.js';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { calculateFightBetweenPlayers } from './fightService.js';
import { CLAN_WAR_PVP_RULES } from '@drpg/core/models/fight/FightConfiguration';
import { archiveFight } from '../dao/archiveDao.js';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';
import { calculatePvPxp, getMaxXp } from '@drpg/core/utils/DinozUtils';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import gameConfig from '../config/game.config.js';
import { createLog } from '../dao/logDao.js';
import { removeItemFromDinoz } from '../dao/dinozItemDao.js';
import { Item } from '@drpg/core/models/item/ItemList';
import { UnavailableReason } from '@drpg/prisma/enums';
import {
	REPAIR_MAX_HP,
	REPAIR_MAX_STACK,
	REPAIR_MAX_TICKS,
	RepairFrequency,
	RESTING_ATTACK_TIMER
} from '@drpg/core/models/clan/clanWar';
import { computeRepairCost, computeWarCost } from '@drpg/core/models/clan/warCalculation';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { sendSseMessageToUserInChannel } from './serverEventService.js';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { SseDataEnum } from '@drpg/core/models/serverEvents/SseData';
import { getRandomArrayElement } from '../utils/tools.js';

export async function eventState() {
	const currentWar = await prisma.clanEvent.findFirst({
		where: {
			AND: [
				{
					endDate: {
						gt: new Date()
					}
				},
				{
					startDate: {
						lt: new Date()
					}
				}
			]
		}
	});
	if (!currentWar) {
		return undefined;
	}
	return {
		id: currentWar.id,
		endDate: currentWar.endDate
	};
}

export async function currentWar() {
	const currentWar = await prisma.clanEvent.findFirst({
		where: {
			AND: [
				{
					endDate: {
						gt: new Date()
					}
				},
				{
					startDate: {
						lt: new Date()
					}
				}
			]
		}
	});
	if (!currentWar) {
		throw new ExpectedError('No event in progress');
	}
	if (currentWar.endDate < new Date()) {
		throw new ExpectedError('War is over');
	}
	return {
		id: currentWar.id,
		config: JSON.parse(currentWar.config) as ClanEventConfig
	};
}

export async function buildClanCastle(req: Request) {
	const authed = await auth(req);
	const war = await currentWar();

	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const hasRight = await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.CLAN_BUILD_CASTLE);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	const existingCastle = await prisma.clanCastle.findUnique({
		where: { clanId: authed.clanId },
		select: { currentLife: true }
	});

	const isRebuild = existingCastle !== null && existingCastle.currentLife <= 0;

	const randomPlace = getRandomArrayElement(war.config.warPlaces);

	await prisma.clanCastle.upsert({
		where: {
			clanId: authed.clanId
		},
		create: {
			placeId: randomPlace,
			clanId: authed.clanId
		},
		update: {
			currentLife: 300
		}
	});

	if (!isRebuild) {
		await prisma.$transaction([
			prisma.clanIngredient.deleteMany({
				where: {
					clanId: authed.clanId
				}
			}),
			prisma.clan.update({
				where: {
					id: authed.clanId
				},
				data: {
					treasureValue: 0
				}
			}),
			prisma.clanWarRanking.upsert({
				where: {
					id: authed.clanId
				},
				create: {
					clanId: authed.clanId,
					eventId: war.id
				},
				update: {}
			})
		]);
	}
	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: authed.clanId } },
			author: { connect: { id: authed.id } },
			type: isRebuild ? ClanHistoryType[ClanHistoryType.CASTLE_REBUILD] : ClanHistoryType[ClanHistoryType.CASTLE_BUILD],
			authorMessage: JSON.stringify({ name: authed.name })
		},
		select: { id: true }
	});
}

export async function declareWar(req: Request) {
	const authed = await auth(req);
	const war = await currentWar();

	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const hasRight = await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	await checkCanDeclareWar(authed.clanId);

	const defender = await prisma.clan.findUnique({
		where: { id: +req.params.clanId },
		select: {
			id: true,
			name: true,
			castle: { select: { id: true, currentLife: true } },
			members: { select: { playerId: true } },
			_count: {
				select: {
					defendingWars: {
						where: { winnerClanId: null }
					}
				}
			}
		}
	});

	const attacker = await prisma.clan.findUnique({
		where: { id: authed.clanId },
		select: {
			id: true,
			name: true,
			castle: { select: { id: true, currentLife: true } },
			members: { select: { playerId: true } },
			ingredients: { select: { ingredientId: true, quantity: true } },
			clanWarRanking: {
				where: { eventId: war.id },
				select: { reputation: true },
				take: 1
			}
		}
	});

	if (!defender || !defender.castle || defender.castle.currentLife <= 0) {
		throw new ExpectedError(translate('clanWar.noCastleOpponent', authed));
	}
	if (!attacker || !attacker.castle || attacker.castle.currentLife <= 0) {
		throw new ExpectedError(translate('clanWar.noCastle', authed));
	}
	if (defender._count.defendingWars >= 3) {
		throw new ExpectedError(translate('clanWar.defenderAlreadyUnderAttack', authed));
	}

	const reputation = attacker.clanWarRanking[0]?.reputation ?? 100;
	const cost = computeWarCost(reputation, attacker.ingredients);

	if (!cost.canAfford) {
		throw new ExpectedError(translate('clanWar.notEnoughIngredients', authed, { cost: cost.totalValue }));
	}

	await consumeWarCost(authed.clanId, cost);

	const endWar = dayjs().add(2, 'day').toDate();
	const attack = await prisma.clanWar.create({
		data: {
			endsAt: endWar,
			attackerClanId: authed.clanId,
			defenderClanId: defender.id,
			eventId: war.id
		}
	});

	const notifications: Promise<void>[] = [];

	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: authed.clanId } },
			author: { connect: { id: authed.id } },
			type: ClanHistoryType[ClanHistoryType.WAR_START],
			authorMessage: JSON.stringify({ name: defender.name })
		},
		select: { id: true }
	});

	attacker.members.forEach(member => {
		notifications.push(
			createNotification(
				member.playerId,
				JSON.stringify({
					clanEvent: ClanHistoryType.WAR_START,
					targetClan: defender.name
				}),
				NotificationSeverity.clanWar,
				`/clan/${attacker.id}/history`
			)
		);
	});

	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: defender.id } },
			author: { connect: { id: authed.id } },
			type: ClanHistoryType[ClanHistoryType.WAR_ATTACKED],
			authorMessage: JSON.stringify({ name: attacker.name })
		},
		select: { id: true }
	});

	defender.members.forEach(member => {
		notifications.push(
			createNotification(
				member.playerId,
				JSON.stringify({
					clanEvent: ClanHistoryType.WAR_ATTACKED,
					targetClan: attacker.name
				}),
				NotificationSeverity.clanWar,
				`/clan/${defender.id}/history`
			)
		);
	});

	await Promise.all(notifications);

	scheduleJob(`war_${attack.id}`, endWar, () => {
		resolveClanWar(attack.id);
	});
}

async function resolveClanWar(warId: string, forfeit?: boolean) {
	const war = await getWarForResolve(warId);

	if (!war) {
		throw new ExpectedError(`War ${warId} not found`);
	}

	let winnerClanId = war.isCastleDestroyed ? war.attacker.id : war.defender.id;
	if (forfeit) {
		winnerClanId = war.defender.id;
	}

	const attackerWon = winnerClanId === war.attacker.id;
	const isCastleDestroyed = forfeit ? false : war.isCastleDestroyed;

	const pwin = computeWarPowers(war, attackerWon);

	await prisma.clanWar.update({
		where: { id: war.id },
		data: {
			winnerClanId,
			isCastleDestroyed
		}
	});

	await prisma.$executeRaw`
		UPDATE clan_war_ranking
		SET
			"totalPWin" = "totalPWin" +
			              CASE
											WHEN "clanId" = ${war.attacker.id} THEN ${pwin.attacker.attackerPWin}
				              WHEN "clanId" = ${war.defender.id} THEN ${pwin.defender.defenderPWin}
											END,
			"totalPLost" = "totalPLost" +
			               CASE
											 WHEN "clanId" = ${war.attacker.id} THEN ${pwin.attacker.attackerPLost}
				               WHEN "clanId" = ${war.defender.id} THEN ${pwin.defender.defenderPLost}
											 END,
			"downtimeCount" =
				CASE
					WHEN "clanId" = ${war.defender.id} AND ${isCastleDestroyed ? 1 : 0} = 1 THEN "downtimeCount" + 1
					WHEN "clanId" = ${war.defender.id} AND ${isCastleDestroyed ? 1 : 0} = 0 THEN 0
					ELSE "downtimeCount"
					END,
			reputation = ROUND((100.0 * POWER(
				(500.0 + ("totalPWin" + CASE
																	WHEN "clanId" = ${war.attacker.id} THEN ${pwin.attacker.attackerPWin}
					                        WHEN "clanId" = ${war.defender.id} THEN ${pwin.defender.defenderPWin}
					END)::float) / (500.0 + ("totalPLost" + CASE
																										WHEN "clanId" = ${war.attacker.id} THEN ${pwin.attacker.attackerPLost}
						                                        WHEN "clanId" = ${war.defender.id} THEN ${pwin.defender.defenderPLost}
					END)::float),
				0.8
			                            ) - ("downtimeCount" * ("downtimeCount" - 1))::float / 2.0)::numeric)
		WHERE "eventId" = ${Prisma.raw(`'${war.eventId}'::uuid`)}
			AND "clanId" = ANY(ARRAY[${war.attacker.id}, ${war.defender.id}]::int[])
	`;

	if (isCastleDestroyed) {
		const annexWars = await prisma.clanWar.findMany({
			where: {
				defenderClanId: war.defender.id,
				winnerClanId: null,
				id: { not: war.id }
			},
			select: {
				id: true,
				attackerClanId: true,
				attacker: {
					select: {
						leaderId: true,
						name: true
					}
				}
			}
		});

		await prisma.$transaction(
			annexWars.map(annexWar =>
				prisma.clanWar.update({
					where: { id: annexWar.id },
					data: {
						winnerClanId: war.defender.id, // défenseur gagne par défaut
						endsAt: new Date(),
						isCastleDestroyed: false
					}
				})
			)
		);

		await Promise.all(
			annexWars.map(annexWar =>
				prisma.$transaction([
					// Historique clan attaquant
					prisma.clanHistory.create({
						data: {
							clan: { connect: { id: annexWar.attackerClanId } },
							type: ClanHistoryType[ClanHistoryType.WAR_CANCELLED],
							authorMessage: JSON.stringify({
								defenderName: war.defender.name,
								destroyedBy: war.attacker.name
							}),
							author: { connect: { id: annexWar.attacker.leaderId } }
						},
						select: { id: true }
					}),
					// Notification chef clan attaquant
					prisma.notification.create({
						data: {
							message: JSON.stringify({
								defenderName: war.defender.name,
								destroyedBy: war.attacker.name
							}),
							severity: NotificationSeverity.clanWar,
							playerId: annexWar.attacker.leaderId
						}
					})
				])
			)
		);
	}

	await notifyWarResults(war, forfeit);

	const reason = isCastleDestroyed ? 'castle detroyed' : forfeit ? 'forfeit' : 'expiration';
	LOGGER.log(`War ${warId} is over by ${reason}.`);
	const job = scheduledJobs[`war_${warId}`];
	if (job) {
		LOGGER.log(`Job war_${warId} is canceled.`);
		job.cancel();
	}
}

async function notifyWarResults(
	war: Pick<ClanWar, 'isCastleDestroyed'> & {
		attacker: Pick<Clan, 'id' | 'leaderId' | 'name'> & {
			members: Pick<ClanMember, 'playerId'>[];
		};
		defender: Pick<Clan, 'id' | 'leaderId' | 'name'> & {
			members: Pick<ClanMember, 'playerId'>[];
		};
	},
	forfeit?: boolean
) {
	const attackerWon = war.isCastleDestroyed;
	const notifications: Promise<void>[] = [];
	if (attackerWon) {
		await prisma.$transaction([
			// Attacker history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: war.attacker.id } },
					author: { connect: { id: war.attacker.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_WON],
					authorMessage: JSON.stringify({ name: war.defender.name })
				},
				select: { id: true }
			}),
			// Defender history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: war.defender.id } },
					author: { connect: { id: war.defender.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_LOSED],
					authorMessage: JSON.stringify({ name: war.attacker.name })
				},
				select: { id: true }
			})
		]);
		war.attacker.members.forEach(member => {
			notifications.push(
				createNotification(
					member.playerId,
					JSON.stringify({
						clanEvent: ClanHistoryType.WAR_WON,
						targetClan: war.defender.name
					}),
					NotificationSeverity.clanWar,
					`/clan/${war.attacker.id}/history`
				)
			);
		});
		war.defender.members.forEach(member => {
			notifications.push(
				createNotification(
					member.playerId,
					JSON.stringify({
						clanEvent: ClanHistoryType.WAR_LOSED,
						targetClan: war.attacker.name
					}),
					NotificationSeverity.clanWar,
					`/clan/${war.defender.id}/history`
				)
			);
		});
	} else {
		await prisma.$transaction([
			// Attacker history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: war.attacker.id } },
					author: { connect: { id: war.attacker.leaderId } },
					type: ClanHistoryType[forfeit ? ClanHistoryType.WAR_FORFEIT : ClanHistoryType.WAR_LOSE],
					authorMessage: JSON.stringify({ name: war.defender.name })
				},
				select: { id: true }
			}),
			// Defender history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: war.defender.id } },
					author: { connect: { id: war.defender.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_DEFENDED],
					authorMessage: JSON.stringify({ name: war.attacker.name })
				},
				select: { id: true }
			})
		]);
		war.attacker.members.forEach(member => {
			notifications.push(
				createNotification(
					member.playerId,
					JSON.stringify({
						clanEvent: ClanHistoryType[forfeit ? ClanHistoryType.WAR_FORFEIT : ClanHistoryType.WAR_LOSE],
						targetClan: war.defender.name
					}),
					NotificationSeverity.clanWar,
					`/clan/${war.attacker.id}/history`
				)
			);
		});
		war.defender.members.forEach(member => {
			notifications.push(
				createNotification(
					member.playerId,
					JSON.stringify({
						clanEvent: ClanHistoryType.WAR_DEFENDED,
						targetClan: war.attacker.name
					}),
					NotificationSeverity.clanWar,
					`/clan/${war.defender.id}/history`
				)
			);
		});
	}
	await Promise.all(notifications);
}

export async function scheduleWarExpiration() {
	const currentWar = await prisma.clanEvent.findFirst({
		where: {
			AND: [
				{
					endDate: {
						gt: new Date()
					}
				},
				{
					startDate: {
						lt: new Date()
					}
				}
			]
		}
	});
	if (!currentWar || currentWar.endDate < new Date()) {
		LOGGER.log('No war event ongoing.');
		return;
	}

	const oingoingWar = await prisma.clanWar.findMany({
		where: {
			winnerClanId: null
		}
	});

	oingoingWar.forEach(war => {
		scheduleJob(`war_${war.id}`, war.endsAt, () => {
			resolveClanWar(war.id);
		});
		LOGGER.log(`Scheduling war ${war.id} expiration at ${war.endsAt}`);
	});

	const dinozResting = await prisma.dinoz.updateMany({
		where: {
			unavailableReason: UnavailableReason.restingAttack
		},
		data: {
			unavailableReason: null
		}
	});

	LOGGER.log(`Reset attack timers for ${dinozResting.count} dinoz.`);

	const remainingRepairs = await prisma.clanCastleRepair.findMany({
		where: { appliedTicks: { lt: prisma.clanCastleRepair.fields.totalTicks } }
	});

	remainingRepairs.forEach(repair => {
		scheduleRepairTicks(repair.id, repair.castleId, repair.hpPerTick, repair.frequency, repair.totalTicks);
		LOGGER.log(`Scheduling repair ${repair.id}.`);
	});
}

export async function warStatus(req: Request) {
	const clanId = +req.params.clanId;

	return await prisma.clanWar.findMany({
		where: {
			OR: [
				{ attackerClanId: clanId, endsAt: { gt: new Date() } },
				{ defenderClanId: clanId, endsAt: { gt: new Date() } }
			],
			winnerClanId: null
		},
		select: {
			id: true,
			attacker: {
				select: {
					id: true,
					name: true
				}
			},
			defender: {
				select: {
					id: true,
					name: true
				}
			},
			endsAt: true
		}
	});
}

export async function forfeitWar(req: Request) {
	const authed = await auth(req);
	await currentWar();
	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}
	const hasRight = await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	await resolveClanWar(req.params.warId, true);
}

export async function addDefender(req: Request) {
	const authed = await auth(req);
	const currentWarEvent = await currentWar();
	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}
	const dinoz = await prisma.dinoz.findUnique({
		where: {
			id: +req.params.dinozId
		},
		select: {
			id: true,
			name: true,
			display: true,
			maxLife: true,
			life: true,
			placeId: true,
			playerId: true,
			unavailableReason: true
		}
	});

	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: +req.params.dinozId }));
	}
	if (dinoz.playerId !== authed.id) {
		throw new ExpectedError(translate('error.notYourDinoz', authed));
	}
	if (dinoz.unavailableReason || dinoz.life <= 0) {
		throw new ExpectedError(translate('DinozIsDead', authed));
	}

	const castle = await prisma.clanCastle.findUnique({
		where: {
			clanId: authed.clanId
		},
		select: {
			placeId: true,
			defender: true,
			_count: {
				select: { defender: true }
			}
		}
	});

	if (!castle) {
		throw new ExpectedError(translate('clanWar.noCastle', authed));
	}
	if (castle.placeId !== dinoz.placeId) {
		throw new ExpectedError(translate('error.dinozWrongLocation', authed));
	}

	if (castle._count.defender >= currentWarEvent.config.fight.defenderActiveMax) {
		throw new ExpectedError(translate('clanWar.defenderActiveMax', authed));
	}

	if (castle.defender.some(d => d.id === dinoz.id)) {
		throw new ExpectedError(translate('clanWar.alreadyInDefense', authed));
	}

	const defendLine = await prisma.clanCastle.update({
		where: {
			clanId: authed.clanId
		},
		data: {
			defender: {
				connect: {
					id: dinoz.id
				}
			},
			defenseOrder: {
				push: dinoz.id
			}
		},
		select: {
			defender: {
				select: {
					id: true,
					name: true,
					display: true,
					maxLife: true,
					life: true
				}
			}
		}
	});

	await updateDinoz(dinoz.id, { unavailableReason: UnavailableReason.defending });
	return defendLine;
}

export async function castleStatus(req: Request) {
	const authed = await auth(req);
	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}
	const castle = await prisma.clanCastle.findUnique({
		where: {
			clanId: authed.clanId
		},
		select: {
			maxLife: true,
			currentLife: true,
			defenseOrder: true,
			defender: {
				select: {
					id: true,
					name: true,
					life: true,
					maxLife: true,
					display: true,
					level: true
				}
			},
			repairs: {
				where: {
					appliedTicks: { lt: prisma.clanCastleRepair.fields.totalTicks }
				}
			}
		}
	});

	return castle;
}

export async function removeDefender(req: Request) {
	const authed = await auth(req);

	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const dinoz = await prisma.dinoz.findUnique({
		where: { id: +req.params.dinozId },
		select: {
			id: true,
			playerId: true
		}
	});

	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: +req.params.dinozId }));
	}

	if (dinoz.playerId !== authed.id) {
		throw new ExpectedError(translate('error.notYourDinoz', authed));
	}

	const castle = await prisma.clanCastle.findUnique({
		where: { clanId: authed.clanId },
		select: { id: true, defenseOrder: true }
	});

	if (!castle) {
		throw new ExpectedError(translate('clanWar.noCastle', authed));
	}

	const [defendLine] = await prisma.$transaction([
		prisma.clanCastle.update({
			where: { clanId: authed.clanId },
			data: {
				defender: { disconnect: { id: dinoz.id } },
				defenseOrder: {
					set: castle.defenseOrder.filter(id => id !== dinoz.id)
				}
			},
			select: {
				defenseOrder: true,
				defender: {
					select: {
						id: true,
						name: true,
						display: true,
						maxLife: true,
						life: true
					}
				}
			}
		}),
		prisma.dinoz.update({
			where: { id: dinoz.id },
			data: { unavailableReason: null }
		})
	]);

	return defendLine;
}

export async function updateDefenseOrder(req: Request) {
	const authed = await auth(req);

	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const hasRight = await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	const { dinozIds } = req.body as { dinozIds: number[] };

	const castle = await prisma.clanCastle.findUnique({
		where: { clanId: authed.clanId },
		select: { defender: { select: { id: true } } }
	});

	if (!castle) {
		throw new ExpectedError(translate('clanWar.noCastle', authed));
	}

	const validIds = new Set(castle.defender.map(d => d.id));
	const isValid = dinozIds.length === validIds.size && dinozIds.every(id => validIds.has(id));

	if (!isValid) {
		throw new ExpectedError('invalidDefenseOrder');
	}

	return prisma.clanCastle.update({
		where: { clanId: authed.clanId },
		data: { defenseOrder: dinozIds },
		select: { defenseOrder: true }
	});
}

export async function attackCastle(req: Request) {
	const dinozId = +req.params.dinozId;
	const authed = await auth(req);
	const now = new Date();

	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const warAttack = await prisma.clan.findUnique({
		where: {
			id: authed.clanId
		},
		select: {
			attackingWars: {
				where: {
					winnerClanId: null
				},
				take: 1,
				select: {
					id: true,
					defender: {
						select: {
							name: true,
							castle: {
								select: {
									id: true,
									placeId: true,
									currentLife: true,
									maxLife: true,
									defenseOrder: true,
									_count: {
										select: {
											repairs: {
												where: {
													appliedTicks: { lt: prisma.clanCastleRepair.fields.totalTicks }
												}
											}
										}
									}
								}
							},
							members: {
								select: {
									playerId: true
								}
							}
						}
					},
					attacker: {
						select: {
							castle: {
								select: {
									id: true,
									currentLife: true
								}
							}
						}
					},
					defenderClanId: true,
					attackerClanId: true
				}
			}
		}
	});

	const activeWar = warAttack?.attackingWars[0];

	if (!warAttack || !activeWar || !activeWar.defender.castle) {
		throw new ExpectedError(translate('clanWar.notWar', authed));
	}

	if (!activeWar.attacker.castle || activeWar.attacker.castle.currentLife <= 0) {
		throw new ExpectedError(translate('clanWar.noCastle', authed));
	}

	const player = await getDinozFightClanDataRequest(dinozId, authed.id);

	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	const dinoz = player.dinoz.find(d => d.id === dinozId);
	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}
	let team = player.dinoz;
	if (team.some(d => d.placeId !== activeWar.defender.castle?.placeId)) {
		throw new ExpectedError(translate('error.dinozWrongLocation', authed));
	}

	if (team.some(d => d.unavailableReason !== null || !d.fight)) {
		throw new ExpectedError(translate('missingIrma', authed));
	}

	const unavailableFollowers = team.filter(d => d.life <= 0 || d.unavailableReason !== null);
	if (unavailableFollowers.length > 0) {
		for (const d of unavailableFollowers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
		team = team.filter(d => d.life > 0 && d.unavailableReason === null);
	}

	await setSpecificStat(StatTracking.GDC_ATK, player.id, team.length);

	const teamLevel = team.reduce((acc, dinoz) => acc + dinoz.level, 0);
	const defenders = await computeDefenderTeam(teamLevel, team.length, activeWar.defender.castle.id);

	const fight = calculateFightBetweenPlayers(
		CLAN_WAR_PVP_RULES,
		team,
		player.cooker,
		defenders,
		defenders.some(d => d.skills.some(s => s.skillId === Skill.CUISINIER)),
		activeWar.defender.castle?.placeId
	);

	const victory = fight.outcome === FightOutcome.AttackerWin;
	// Add castle information
	fight.steps.unshift({
		action: 'addCastle',
		castle: {
			life: activeWar.defender.castle.currentLife,
			maxLife: activeWar.defender.castle.maxLife,
			repair: activeWar.defender.castle._count.repairs
		}
	});
	let totalCastleDamage = 0;

	// Attack castle only and only if all defenders were eleminated.
	if (victory) {
		for (const survivor of fight.fighters.filter(d => d.attacker && d.survived)) {
			const castleDamage = Math.max(1, Math.ceil(survivor.level / 6));
			fight.steps.push({
				action: 'attackCastle',
				fid: survivor.id,
				damages: castleDamage
			});
			totalCastleDamage += castleDamage;
		}
	}

	// Cap total damage to castle HP.
	totalCastleDamage = Math.min(totalCastleDamage, activeWar.defender.castle.currentLife);

	const archive = await archiveFight(
		fight,
		victory,
		authed.id,
		null,
		JSON.stringify({ placeId: activeWar.defender.castle.placeId })
	);

	const castle = await prisma.clanCastle.update({
		where: {
			id: activeWar.defender.castle.id
		},
		data: {
			currentLife: {
				decrement: totalCastleDamage
			}
		},
		select: {
			currentLife: true
		}
	});

	// Add attack history
	await prisma.$transaction([
		// Attacker history
		prisma.clanHistory.create({
			data: {
				clan: { connect: { id: activeWar.attackerClanId } },
				author: { connect: { id: authed.id } },
				type: ClanHistoryType[ClanHistoryType.WAR_PLAYER_ATTACKED],
				authorMessage: JSON.stringify({
					damage: totalCastleDamage,
					archiveId: archive.id,
					clan: activeWar.defender.name
				})
			},
			select: { id: true }
		}),
		// Defender history
		prisma.clanHistory.create({
			data: {
				clan: { connect: { id: activeWar.defenderClanId } },
				author: { connect: { id: authed.id } },
				type: ClanHistoryType[ClanHistoryType.WAR_PLAYER_ATTACK],
				authorMessage: JSON.stringify({ damage: totalCastleDamage, archiveId: archive.id })
			},
			select: { id: true }
		})
	]);

	if (castle.currentLife <= 0) {
		await prisma.clanWar.update({
			where: {
				id: activeWar.id
			},
			data: {
				isCastleDestroyed: true
			}
		});
		await resolveClanWar(activeWar.id);
	}

	let totalWinXP = 0;
	let levelup = false;
	for (const d of team) {
		let xp = 0;
		const cur = d.level / teamLevel;

		/** Restrict the use of low level dinoz in order to make easy money **/
		let gfact = 1.0;
		if (d.experience >= getMaxXp(d) && d.level < gameConfig.dinoz.maxLevel) gfact = 0.1;
		/** Dinoz with malediction not generating gold **/
		if (d.status.some(status => status.statusId === DinozStatusId.CURSED)) {
			gfact = 0.0;
		}

		for (const defender of defenders) {
			const factor = defender.level >= d.level ? 1 : 4 / (4 + (d.level - defender.level));
			xp = Math.round(calculatePvPxp(defender.level, d.level) * factor * cur);
			const max = getMaxXp(d);
			if (d.experience >= max) {
				// No xp if the dinoz was already at max
				levelup = true;
				xp = 0;
			} else if (d.experience + xp >= max) {
				// Else, allow xp overflow (should happen only once) and raise levelup flag
				levelup = true;
			}
		}
		totalWinXP += xp;
		const attacker = fight.attackers.find(a => a.dinozId === d.id);
		if (!attacker) {
			throw new ExpectedError(`Attacker ${d.id} doesn't exist.`);
		}

		await updateDinoz(d.id, {
			life: {
				decrement: attacker.hpLost
			},
			experience: {
				increment: victory ? xp : 0
			},
			fight: false,
			unavailableReason: UnavailableReason.restingAttack
		});
		scheduleJob(`${UnavailableReason.restingAttack}_${d.id}`, now.getTime() + RESTING_ATTACK_TIMER, () =>
			unrestingAttackingDinoz(d.id)
		);
		await createLog(LogType.XPEarned, authed.id, d.id, victory ? xp : 0);
		await createLog(LogType.HPLost, authed.id, d.id, attacker.hpLost);

		if (attacker.hpLost >= d.life) {
			await createLog(LogType.Death, authed.id, d.id);
		}
	}

	for (const d of defenders) {
		let xp = 0;
		const cur = d.level / teamLevel;

		for (const attacker of team) {
			const factor = attacker.level >= d.level ? 1 : 4 / (4 + (d.level - attacker.level));
			xp = calculatePvPxp(attacker.level, d.level) * factor * cur;
			const max = getMaxXp(d);
			if (d.experience >= max) {
				xp = 0;
			}
		}
		const defenderFighter = fight.defenders.find(a => a.dinozId === d.id);
		if (!defenderFighter) {
			throw new ExpectedError(`Defender ${d.id} doesn't exist.`);
		}

		await updateDinoz(d.id, {
			life: {
				decrement: defenderFighter.hpLost
			},
			experience: {
				increment: !victory ? xp : 0
			}
		});
		await createLog(LogType.XPEarned, d.playerId, d.id, victory ? xp : 0);
		await createLog(LogType.HPLost, d.playerId, d.id, defenderFighter.hpLost);

		if (defenderFighter.hpLost >= d.life) {
			await prisma.clanCastle.update({
				where: {
					id: activeWar.defender.castle.id
				},
				data: {
					defender: {
						disconnect: {
							id: d.id
						}
					},
					defenseOrder: {
						set: activeWar.defender.castle.defenseOrder.filter(id => id !== d.id)
					}
				}
			});
			await updateDinoz(d.id, { unavailableReason: null });
			await createLog(LogType.Death, d.playerId, d.id);
		}
	}

	// Consume items for attackers
	let merguezUsed = 0;
	for (const fighter of [...fight.attackers]) {
		for (const itemUsed of fighter.itemsUsed) {
			await removeItemFromDinoz(fighter.dinozId, itemUsed);

			if (itemUsed === Item.GOBLIN_MERGUEZ) {
				merguezUsed++;
			}
		}
	}
	await setSpecificStat(StatTracking.MERGUEZ, authed.id, merguezUsed);

	// Consume items for defenders
	for (const fighter of [...fight.defenders]) {
		for (const itemUsed of fighter.itemsUsed) {
			await removeItemFromDinoz(fighter.dinozId, itemUsed);

			if (itemUsed === Item.GOBLIN_MERGUEZ && fighter.playerId) {
				await setSpecificStat(StatTracking.MERGUEZ, fighter.playerId, 1);
			}
		}
	}

	for (const player of activeWar.defender.members)
		sendSseMessageToUserInChannel(player.playerId, SseChannel.NOTIFICATION, {
			type: SseDataEnum.CLAN_WAR,
			war: {
				attacker: authed.name,
				hpLost: totalCastleDamage
			}
		});

	return {
		fighters: fight.fighters,
		goldEarned: victory ? 1 : 0,
		xpEarned: victory ? totalWinXP : 0,
		levelUp: levelup,
		totalHpLost: fight.attackers.reduce((partialSum, a) => partialSum + a.hpLost, 0),
		result: victory,
		history: fight.steps,
		hpLost: fight.attackers.map(a => ({
			id: a.dinozId,
			hpLost: a.hpLost
		})),
		itemsUsed: fight.attackers.map(a => ({
			id: a.dinozId,
			itemsUsed: a.itemsUsed
		})),
		place: activeWar.defender.castle.placeId
	};
}

export async function computeDefenderTeam(attackerPower: number, teamSize: number, castleId: number) {
	const defenderList = await prisma.clanCastle.findUniqueOrThrow({
		where: {
			id: castleId
		},
		select: {
			defender: {
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
				}
			},
			defenseOrder: true
		}
	});

	const { defender, defenseOrder } = defenderList;

	const sortedDefenders = defenseOrder.map(id => defender.find(d => d.id === id)).filter(Boolean);
	let defenderPower = 0;
	let index = 0;
	const defenderTeam = [];
	while (defenderPower < attackerPower) {
		const def = sortedDefenders[index];
		if (!def) {
			break;
		}
		defenderTeam.push(def);
		index++;
		if (index >= sortedDefenders.length || index >= 6) {
			defenderPower = attackerPower;
		}
		defenderPower += def.level;

		// Add a second time the level if the dinoz defender is Brave
		if (def.skills.some(skill => skill.skillId === Skill.BRAVE)) {
			defenderPower += def.level;
		}
	}

	return defenderTeam.filter(d => d !== undefined);
}

async function unrestingAttackingDinoz(dinozId: number) {
	await updateDinoz(dinozId, { unavailableReason: null });
}

export async function repairCastle(req: Request) {
	const authed = await auth(req);

	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const hasRight = await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	const { hpPerTick, frequency, tick } = req.body as {
		hpPerTick: number;
		frequency: RepairFrequency;
		tick: number;
	};

	if (hpPerTick < 1 || hpPerTick > 10) {
		throw new ExpectedError('invalidRepairHp');
	}
	if (!Object.values(RepairFrequency).includes(frequency)) {
		throw new ExpectedError('invalidRepairFrequency');
	}

	const castle = await prisma.clanCastle.findUnique({
		where: { clanId: authed.clanId },
		select: {
			id: true,
			currentLife: true,
			maxLife: true,
			repairs: {
				where: { appliedTicks: { lt: prisma.clanCastleRepair.fields.totalTicks } },
				select: { id: true }
			}
		}
	});

	if (!castle) {
		throw new ExpectedError(translate('clanWar.noCastle', authed));
	}

	if (castle.currentLife <= 0) {
		throw new ExpectedError(translate('clanWar.castleDestroyed', authed));
	}

	if (castle.currentLife >= castle.maxLife) {
		throw new ExpectedError(translate('clanWar.castleFullLife', authed));
	}

	if (castle.repairs.length >= REPAIR_MAX_STACK) {
		throw new ExpectedError(translate('clanWar.repairStackFull', authed));
	}

	// Get clan ingredients
	const clan = await prisma.clan.findUnique({
		where: { id: authed.clanId },
		select: {
			ingredients: { select: { ingredientId: true, quantity: true } }
		}
	});

	if (!clan) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const cost = computeRepairCost(hpPerTick, frequency, tick, clan.ingredients);

	if (!cost.canAfford) {
		throw new ExpectedError(translate('clanWar.notEnoughIngredientsForRepair', authed));
	}

	// Consume ingredients
	await consumeRepairCost(authed.clanId, cost);

	// Total duration = totalTicks * frequency
	const durationMs = tick * frequency * 60 * 1000;
	const endsAt = new Date(Date.now() + durationMs);

	const repair = await prisma.clanCastleRepair.create({
		data: {
			castleId: castle.id,
			hpPerTick,
			frequency,
			totalTicks: tick,
			endsAt
		}
	});

	// schedule ticks
	scheduleRepairTicks(repair.id, castle.id, hpPerTick, frequency, REPAIR_MAX_TICKS);

	return;
}

function scheduleRepairTicks(
	repairId: number,
	castleId: number,
	hpPerTick: number,
	frequency: RepairFrequency,
	totalTicks: number
) {
	let tickCount = 0;

	const job = scheduleJob(
		`repair_${repairId}`,
		{ rule: `*/${frequency} * * * *` }, // cron selon la fréquence
		async () => {
			tickCount++;

			const castle = await prisma.clanCastle.findUnique({
				where: { id: castleId },
				select: { currentLife: true, maxLife: true }
			});

			if (!castle) {
				job.cancel();
				return;
			}

			const hpToApply = Math.min(
				hpPerTick,
				REPAIR_MAX_HP - (tickCount - 1) * hpPerTick // HP restants avant le cap
			);
			const newLife = Math.min(castle.currentLife + hpToApply, castle.maxLife);

			await prisma.$transaction([
				prisma.clanCastle.update({
					where: { id: castleId },
					data: { currentLife: newLife }
				}),
				prisma.clanCastleRepair.update({
					where: { id: repairId },
					data: { appliedTicks: { increment: 1 } }
				})
			]);

			if (tickCount * hpPerTick >= REPAIR_MAX_HP || tickCount >= totalTicks) {
				job.cancel();
			}
		}
	);
}
