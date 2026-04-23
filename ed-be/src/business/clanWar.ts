import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Clan, ClanWar, ClanWarRanking, NotificationSeverity } from '@drpg/prisma';
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

const WAR_BASE_POINTS = 50;
const CLAN_BASE_POINT = 1000;
const CLAN_BASE_REPUTATION = 100;
const REPUTATION_BASE_GAIN = 10;
const REPUTATION_BASE_LOSS = 8;

export async function eventState() {
	const currentWar = await prisma.clanEvent.findFirst({
		where: {
			endDate: {
				gt: new Date()
			}
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
			endDate: {
				gt: new Date()
			}
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
			endDate: {
				gt: new Date()
			}
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
