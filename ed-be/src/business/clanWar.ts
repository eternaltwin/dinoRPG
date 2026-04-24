import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Clan, ClanWar, ClanWarRanking, LogType, NotificationSeverity } from '@drpg/prisma';
import { Request } from 'express';
import { LOGGER } from '../context.js';
import { playerHasRightRequest } from '../dao/clansDao.js';
import { createNotification } from '../dao/notificationDao.js';
import { auth } from '../dao/playerDao.js';
import translate from '../utils/translate.js';
import { prisma } from '../prisma.js';
import { ClanEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import dayjs from 'dayjs';
import { ClanHistoryType } from '@drpg/core/models/enums/ClanHistoryType';
import { scheduleJob } from 'node-schedule';
import { computeReputation, computeWarPowers } from '../utils/warCalculation.js';
import { getDinozFightClanDataRequest, updateDinoz } from '../dao/dinozDao.js';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { calculateFightBetweenPlayers } from './fightService.js';
import { CLAN_WAR_PVP_RULES, STANDARD_PVP_RULES } from '@drpg/core/models/fight/FightConfiguration';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { archiveFight } from '../dao/archiveDao.js';
import { FightOutcome } from '@drpg/core/models/fight/FightResult';
import { getRandomNumber } from '../utils/index.js';
import { calculatePvPxp, calculateXPBonus, getMaxXp } from '@drpg/core/utils/DinozUtils';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import gameConfig from '../config/game.config.js';
import { createLog } from '../dao/logDao.js';
import { removeItemFromDinoz } from '../dao/dinozItemDao.js';
import { Item } from '@drpg/core/models/item/ItemList';
import { UnavailableReason } from '@drpg/prisma/enums';

const WAR_BASE_POINTS = 50;
const CLAN_BASE_POINT = 1000;
const CLAN_BASE_REPUTATION = 100;
const REPUTATION_BASE_GAIN = 10;
const REPUTATION_BASE_LOSS = 8;

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

	const randomPlace = war.config.warPlaces[Math.round(Math.random() * war.config.warPlaces.length) - 1];

	await prisma.clanCastle.upsert({
		where: {
			clanId: authed.clanId
		},
		create: {
			placeId: randomPlace,
			clanId: authed.clanId
		},
		update: {
			// Do nothing
		}
	});

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
	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: authed.clanId } },
			author: { connect: { id: authed.id } },
			type: ClanHistoryType[ClanHistoryType.CASTLE_BUILD],
			authorMessage: authed.name
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

	const attackOngoing = await prisma.clanWar.findUnique({
		where: {
			attackerClanId: authed.clanId,
			endsAt: {
				gt: new Date()
			}
		}
	});

	if (attackOngoing) {
		throw new ExpectedError('War already ongoing for your clan');
	}

	const defender = await prisma.clan.findUnique({
		where: {
			id: +req.params.clanId
		},
		select: {
			id: true,
			name: true,
			castle: {
				select: {
					id: true
				}
			},
			members: {
				select: {
					playerId: true
				}
			}
		}
	});

	const attacker = await prisma.clan.findUnique({
		where: {
			id: authed.clanId
		},
		select: {
			id: true,
			name: true,
			castle: {
				select: {
					id: true
				}
			},
			members: {
				select: {
					playerId: true
				}
			}
		}
	});

	if (!defender || !defender.castle || !attacker || !attacker.castle) {
		throw new ExpectedError(translate('clan.noCastle', authed));
	}

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
	// Notifications for attackers
	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: authed.clanId } },
			author: { connect: { id: authed.id } },
			type: ClanHistoryType[ClanHistoryType.WAR_START],
			authorMessage: defender.name
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
				NotificationSeverity.clanWar
			)
		);
	});

	// Notifications for defenders
	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: defender.id } },
			author: { connect: { id: authed.id } },
			type: ClanHistoryType[ClanHistoryType.WAR_ATTACKED],
			authorMessage: attacker.name
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
				NotificationSeverity.clanWar
			)
		);
	});

	await Promise.all(notifications);

	scheduleJob(`attack_${attack.id}`, endWar, () => {
		resolveClanWar(attack.id);
	});
}

async function resolveClanWar(warId: string, forfeit?: boolean) {
	const war = await prisma.clanWar.findUnique({
		where: {
			id: warId
		},
		select: {
			id: true,
			eventId: true,
			attacker: {
				select: {
					id: true,
					leaderId: true,
					clanWarRanking: true
				}
			},
			defender: {
				select: {
					id: true,
					leaderId: true,
					clanWarRanking: true
				}
			},
			isCastleDestroyed: true
		}
	});
	if (!war) {
		LOGGER.error(`War ${warId} not found`);
		return;
	}
	let winnerClanId = war.isCastleDestroyed ? war.attacker.id : war.defender.id;

	if (forfeit) {
		winnerClanId = war.defender.id;
	}

	const pwin = computeWarPowers(war);

	await prisma.clanWar.update({
		where: { id: war.id },
		data: {
			winnerClanId: winnerClanId,
			isCastleDestroyed: war.isCastleDestroyed
		}
	});

	await prisma.$executeRaw`
WITH updated AS (
  UPDATE clan_war_ranking
  SET
    total_p_win = total_p_win +
      CASE
        WHEN clan_id = ${war.attacker.id} THEN ${pwin.attacker.attackerPWin}
        WHEN clan_id = ${war.defender.id} THEN ${pwin.defender.defenderPWin}
      END,
    total_p_lost = total_p_lost +
      CASE
        WHEN clan_id = ${war.attacker.id} THEN ${pwin.attacker.attackerPLost}
        WHEN clan_id = ${war.defender.id} THEN ${pwin.defender.defenderPLost}
      END
  WHERE event_id = ${war.eventId}
    AND clan_id IN (${war.attacker.id}, ${war.defender.id})
  RETURNING id, total_p_win, total_p_lost
)

UPDATE clan_war_ranking cwr
SET reputation = 100 * POWER(
  (500.0 + u.total_p_win) / (500.0 + u.total_p_lost),
  0.8
)
FROM updated u
WHERE cwr.id = u.id;
`;

	await notifyWarResults(war, forfeit);
}

async function notifyWarResults(
	war: Pick<ClanWar, 'isCastleDestroyed'> & {
		attacker: Pick<Clan, 'id' | 'leaderId'>;
		defender: Pick<Clan, 'id' | 'leaderId'>;
	},
	forfeit?: boolean
) {
	const attackerWon = war.isCastleDestroyed;
	if (attackerWon) {
		await prisma.$transaction([
			// Attacker history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: war.attacker.id } },
					author: { connect: { id: war.attacker.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_WON],
					authorMessage: ''
				},
				select: { id: true }
			}),
			// Defender history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: war.defender.id } },
					author: { connect: { id: war.defender.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_LOSE],
					authorMessage: ''
				},
				select: { id: true }
			})
		]);
	} else {
		await prisma.$transaction([
			// Attacker history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: war.attacker.id } },
					author: { connect: { id: war.attacker.leaderId } },
					type: ClanHistoryType[forfeit ? ClanHistoryType.WAR_LOSE : ClanHistoryType.WAR_FORFEIT],
					authorMessage: ''
				},
				select: { id: true }
			}),
			// Defender history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: war.defender.id } },
					author: { connect: { id: war.defender.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_DEFENDED],
					authorMessage: ''
				},
				select: { id: true }
			})
		]);
	}
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
			endsAt: {
				gt: new Date()
			}
		}
	});

	oingoingWar.forEach(war => {
		scheduleJob(`attack_${war.id}`, war.endsAt, () => {
			resolveClanWar(war.id);
		});
		LOGGER.log(`Scheduling war ${war.id} expiration at ${war.endsAt}`);
	});
}

export async function warStatus(req: Request) {
	const clanId = +req.params.clanId;

	return await prisma.clanWar.findMany({
		where: {
			OR: [
				{ attackerClanId: clanId, endsAt: { gt: new Date() } },
				{ defenderClanId: clanId, endsAt: { gt: new Date() } }
			]
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

	await resolveClanWar(req.params.id, true);
}

export async function addDefender(req: Request) {
	const authed = await auth(req);
	const currentWarEvent = await currentWar();
	if (!authed.clanId) {
		throw new ExpectedError('invalidDinoz');
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
		throw new ExpectedError('invalidDinoz');
	}
	if (dinoz.playerId !== authed.id) {
		throw new ExpectedError('invalidDinoz');
	}
	if (dinoz.unavailableReason || dinoz.life <= 0) {
		throw new ExpectedError('invalidDinoz');
	}

	const castle = await prisma.clanCastle.findUnique({
		where: {
			clanId: authed.clanId
		},
		select: {
			placeId: true,
			_count: {
				select: { defender: true }
			}
		}
	});
	if (!castle) {
		throw new ExpectedError('invalidDinoz');
	}
	if (castle.placeId !== dinoz.placeId) {
		throw new ExpectedError('invalidDinoz');
	}

	if (castle._count.defender >= currentWarEvent.config.fight.defenderActiveMax) {
		throw new ExpectedError('invalidDinoz');
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
		throw new ExpectedError('invalidDinoz');
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
			}
		}
	});

	return castle;
}

export async function removeDefender(req: Request) {
	const authed = await auth(req);

	if (!authed.clanId) {
		throw new ExpectedError('invalidDinoz');
	}

	const dinoz = await prisma.dinoz.findUnique({
		where: { id: +req.params.dinozId },
		select: {
			id: true,
			playerId: true
		}
	});

	if (!dinoz) {
		throw new ExpectedError('invalidDinoz');
	}

	if (dinoz.playerId !== authed.id) {
		throw new ExpectedError('invalidDinoz');
	}

	const castle = await prisma.clanCastle.findUnique({
		where: { clanId: authed.clanId },
		select: { id: true, defenseOrder: true }
	});

	if (!castle) {
		throw new ExpectedError('invalidDinoz');
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
		throw new ExpectedError('invalidClan');
	}

	const hasRight = await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER);

	if (!hasRight) {
		throw new ExpectedError('forbidden');
	}

	const { dinozIds } = req.body as { dinozIds: number[] };

	const castle = await prisma.clanCastle.findUnique({
		where: { clanId: authed.clanId },
		select: { defender: { select: { id: true } } }
	});

	if (!castle) {
		throw new ExpectedError('invalidCastle');
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

	if (!authed.clanId) {
		throw new ExpectedError('invalidClan');
	}

	const warAttack = await prisma.clan.findUnique({
		where: {
			id: authed.clanId
		},
		select: {
			attackingWar: {
				select: {
					defender: {
						select: {
							castle: {
								select: {
									id: true,
									placeId: true,
									currentLife: true,
									maxLife: true
								}
							}
						}
					}
				}
			}
		}
	});

	if (!warAttack || !warAttack.attackingWar || !warAttack.attackingWar.defender.castle) {
		throw new ExpectedError('forbidden');
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
	if (team.some(d => d.placeId !== warAttack.attackingWar?.defender.castle?.placeId)) {
		throw new ExpectedError('forbidden');
	}

	if (team.some(d => d.unavailableReason !== null)) {
		throw new ExpectedError(`Dinoz is not able to attack.`);
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
	const defenders = await computeDefenderTeam(teamLevel, warAttack.attackingWar.defender.castle.id);

	const fight = calculateFightBetweenPlayers(
		CLAN_WAR_PVP_RULES,
		team,
		false,
		defenders,
		false,
		warAttack.attackingWar?.defender.castle?.placeId
	);

	const victory = fight.outcome === FightOutcome.AttackerWin;
	const fightArchive = await archiveFight(fight, victory, authed.id, null);

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
			xp = calculatePvPxp(defender.level, d.level) * factor * cur;
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
			}
		});
		await createLog(LogType.XPEarned, authed.id, d.id, victory ? xp : 0);
		await createLog(LogType.HPLost, authed.id, d.id, attacker.hpLost);

		if (attacker.hpLost >= d.life) {
			await createLog(LogType.Death, authed.id, d.id);
		}
	}

	for (const d of defenders) {
		let xp = 0;
		const cur = d.level / teamLevel;

		/** Restrict the use of low level dinoz in order to make easy money **/
		let gfact = 1.0;
		if (d.experience >= getMaxXp(d) && d.level < gameConfig.dinoz.maxLevel) gfact = 0.1;
		/** Dinoz with malediction not generating gold **/
		if (d.status.some(status => status.statusId === DinozStatusId.CURSED)) {
			gfact = 0.0;
		}

		for (const defender of team) {
			const factor = defender.level >= d.level ? 1 : 4 / (4 + (d.level - defender.level));
			xp = calculatePvPxp(defender.level, d.level) * factor * cur;
			const max = getMaxXp(d);
			if (d.experience >= max) {
				xp = 0;
			}
		}
		const attacker = fight.defenders.find(a => a.dinozId === d.id);
		if (!attacker) {
			throw new ExpectedError(`Attacker ${d.id} doesn't exist.`);
		}

		await updateDinoz(d.id, {
			life: {
				decrement: attacker.hpLost
			},
			experience: {
				increment: !victory ? xp : 0
			}
		});
		await createLog(LogType.XPEarned, d.playerId, d.id, victory ? xp : 0);
		await createLog(LogType.HPLost, d.playerId, d.id, attacker.hpLost);

		if (attacker.hpLost >= d.life) {
			await createLog(LogType.Death, d.playerId, d.id);
		}
	}

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

	for (const fighter of [...fight.defenders]) {
		for (const itemUsed of fighter.itemsUsed) {
			await removeItemFromDinoz(fighter.dinozId, itemUsed);

			if (itemUsed === Item.GOBLIN_MERGUEZ && fighter.playerId) {
				await setSpecificStat(StatTracking.MERGUEZ, fighter.playerId, 1);
			}
		}
	}

	// Add castle informations
	fight.steps.unshift({
		action: 'addCastle',
		castle: {
			life: warAttack.attackingWar.defender.castle.currentLife,
			maxLife: warAttack.attackingWar.defender.castle.maxLife
		}
	});

	if (victory) {
		for (const survivor of fight.attackers) {
			//TODO survivor attack cast
			fight.steps.push({
				action: 'attackCastle',
				fid: survivor.dinozId,
				damages: fight.fighters.find(d => d.id === survivor.dinozId)?.level ?? 0
			});
		}
	}

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
		place: warAttack.attackingWar.defender.castle.placeId
	};
}

export async function computeDefenderTeam(attackerPower: number, castleId: number) {
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
		console.log(index, defenderPower, sortedDefenders[index]?.level ?? 0);
		defenderTeam.push(sortedDefenders[index]);
		index++;
		if (index >= sortedDefenders.length) {
			defenderPower = attackerPower;
		}
		defenderPower += sortedDefenders[index]?.level ?? 0;
	}

	return defenderTeam.filter(d => d !== undefined);
}
