import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Clan, ClanWarRanking, NotificationSeverity } from '@drpg/prisma';
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
			attackerId: authed.clanId,
			dateEnd: {
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
			clanWarRanking: {
				select: {
					points: true
				},
				where: {
					eventId: war.id
				}
			},
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
			clanWarRanking: {
				select: {
					points: true
				},
				where: {
					eventId: war.id
				}
			},
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

	// Compute bidded points
	const points = computeWarPointsDelta(
		attacker.clanWarRanking?.points ?? 1000,
		defender.clanWarRanking?.points ?? 1000
	);

	const endWar = dayjs().add(2, 'day').toDate();
	const attack = await prisma.clanWar.create({
		data: {
			dateEnd: endWar,
			attackerId: authed.clanId,
			defenderId: defender.id,
			points
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
		looseAttack(attack.id);
	});
}

async function looseAttack(warId: number) {
	const war = await prisma.clanWar.findUnique({
		where: {
			id: warId
		},
		select: {
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
			}
		}
	});
	if (!war) {
		LOGGER.error(`War ${warId} not found`);
		return;
	}

	await computeWarResults(war.attacker, war.defender, false);
}

function computeReputationGain(winner: ClanWarRanking | null, loser: ClanWarRanking | null): number {
	const repDiff = (loser?.reputation ?? CLAN_BASE_REPUTATION) - (winner?.reputation ?? CLAN_BASE_REPUTATION);
	const pointsDiff = (loser?.points ?? CLAN_BASE_POINT) - (winner?.points ?? CLAN_BASE_POINT);

	const repBonus = Math.round(repDiff / 15);
	const pointsBonus = Math.round(pointsDiff / 150);

	return Math.max(3, Math.min(25, REPUTATION_BASE_GAIN + repBonus + pointsBonus));
}

function computeReputationLoss(winner: ClanWarRanking | null, loser: ClanWarRanking | null): number {
	const repDiff = (winner?.reputation ?? CLAN_BASE_REPUTATION) - (loser?.reputation ?? CLAN_BASE_REPUTATION);
	const pointsDiff = (winner?.points ?? CLAN_BASE_POINT) - (loser?.points ?? CLAN_BASE_POINT);

	const repMalus = Math.round(repDiff / 15);
	const pointsMalus = Math.round(pointsDiff / 150);

	return Math.max(2, Math.min(20, REPUTATION_BASE_LOSS + repMalus + pointsMalus));
}

function computeWarPointsDelta(attackerPoints: number, defenderPoints: number): number {
	const totalPoints = attackerPoints + defenderPoints || 1;
	const defenderWeight = defenderPoints / totalPoints;
	const attackerGain = Math.round(WAR_BASE_POINTS * defenderWeight * 2);
	// Plafond retiré ici, plancher à 10 conservé
	return Math.max(10, attackerGain);
}

async function computeWarResults(
	attacker: Pick<Clan, 'id' | 'leaderId'> & {
		clanWarRanking: ClanWarRanking | null;
	},
	defender: Pick<Clan, 'id' | 'leaderId'> & {
		clanWarRanking: ClanWarRanking | null;
	},
	attackerWon: boolean,
	forfeit?: boolean
) {
	/*if (!attacker.clanWarRanking || !defender.clanWarRanking) {
		LOGGER.error(`clanWarRanking not found`);
		return;
	}*/
	const currentClanWar = await currentWar();
	const pointsDelta = computeWarPointsDelta(
		attacker.clanWarRanking?.points ?? CLAN_BASE_POINT,
		defender.clanWarRanking?.points ?? CLAN_BASE_POINT
	);

	const reputationRatio = Math.max(
		0.5,
		Math.min(
			2,
			defender.clanWarRanking?.reputation ??
				CLAN_BASE_REPUTATION / Math.max(1, attacker.clanWarRanking?.reputation ?? CLAN_BASE_REPUTATION)
		)
	);

	const adjustedPoints = Math.min(150, Math.round(pointsDelta * reputationRatio));

	if (attackerWon) {
		await prisma.$transaction([
			// Attacker history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: attacker.id } },
					author: { connect: { id: attacker.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_WON],
					authorMessage: JSON.stringify(adjustedPoints)
				},
				select: { id: true }
			}),
			// Attacker ranking update
			prisma.clanWarRanking.upsert({
				where: {
					eventId: currentClanWar.id,
					clanId: attacker.id
				},
				update: {
					points: {
						increment: adjustedPoints
					},
					reputation: {
						increment: computeReputationGain(attacker.clanWarRanking, defender.clanWarRanking)
					},
					wins: {
						increment: 1
					}
				},
				create: {
					clanId: attacker.id,
					eventId: currentClanWar.id,
					points: CLAN_BASE_POINT + adjustedPoints,
					reputation: CLAN_BASE_REPUTATION + computeReputationGain(attacker.clanWarRanking, defender.clanWarRanking),
					wins: 1
				}
			}),
			// Defender history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: defender.id } },
					author: { connect: { id: defender.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_LOSE],
					authorMessage: JSON.stringify(adjustedPoints)
				},
				select: { id: true }
			}),
			// Defender ranking update
			prisma.clanWarRanking.upsert({
				where: {
					eventId: currentClanWar.id,
					clanId: defender.id
				},
				update: {
					points: {
						decrement: adjustedPoints
					},
					reputation: {
						decrement: computeReputationGain(attacker.clanWarRanking, defender.clanWarRanking)
					},
					losses: {
						increment: 1
					}
				},
				create: {
					clanId: defender.id,
					eventId: currentClanWar.id,
					points: CLAN_BASE_POINT - adjustedPoints,
					reputation: CLAN_BASE_REPUTATION - computeReputationGain(attacker.clanWarRanking, defender.clanWarRanking),
					losses: 1
				}
			})
		]);
	} else {
		await prisma.$transaction([
			// Attacker history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: attacker.id } },
					author: { connect: { id: attacker.leaderId } },
					type: ClanHistoryType[forfeit ? ClanHistoryType.WAR_LOSE : ClanHistoryType.WAR_FORFEIT],
					authorMessage: JSON.stringify(adjustedPoints)
				},
				select: { id: true }
			}),
			// Attacker ranking update
			prisma.clanWarRanking.upsert({
				where: {
					eventId: currentClanWar.id,
					clanId: attacker.id
				},
				update: {
					points: {
						decrement: adjustedPoints
					},
					reputation: {
						decrement: computeReputationLoss(defender.clanWarRanking, attacker.clanWarRanking)
					},
					losses: {
						increment: 1
					}
				},
				create: {
					clanId: attacker.id,
					eventId: currentClanWar.id,
					points: CLAN_BASE_POINT - adjustedPoints,
					reputation: CLAN_BASE_REPUTATION - computeReputationLoss(defender.clanWarRanking, attacker.clanWarRanking),
					losses: 1
				}
			}),
			// Defender history
			prisma.clanHistory.create({
				data: {
					clan: { connect: { id: defender.id } },
					author: { connect: { id: defender.leaderId } },
					type: ClanHistoryType[ClanHistoryType.WAR_DEFENDED],
					authorMessage: JSON.stringify(adjustedPoints)
				},
				select: { id: true }
			}),
			// Defender ranking update
			prisma.clanWarRanking.upsert({
				where: {
					eventId: currentClanWar.id,
					clanId: defender.id
				},
				update: {
					points: {
						increment: adjustedPoints
					},
					reputation: {
						increment: computeReputationGain(defender.clanWarRanking, attacker.clanWarRanking)
					},
					wins: {
						increment: 1
					}
				},
				create: {
					clanId: defender.id,
					eventId: currentClanWar.id,
					points: CLAN_BASE_POINT + adjustedPoints,
					reputation: CLAN_BASE_REPUTATION + computeReputationGain(defender.clanWarRanking, attacker.clanWarRanking),
					wins: 1
				}
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
			dateEnd: {
				gt: new Date()
			}
		}
	});

	oingoingWar.forEach(war => {
		scheduleJob(`attack_${war.id}`, war.dateEnd, () => {
			looseAttack(war.id);
		});
		LOGGER.log(`Scheduling war ${war.id} expiration at ${war.dateEnd}`);
	});
}

export async function warStatus(req: Request) {
	const clanId = +req.params.clanId;

	return await prisma.clanWar.findMany({
		where: {
			OR: [
				{ attackerId: clanId, dateEnd: { gt: new Date() } },
				{ defenderId: clanId, dateEnd: { gt: new Date() } }
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
			dateEnd: true,
			points: true
		}
	});
}

export async function forfeitWar(req: Request) {
	const authed = await auth(req);
	const currentClanWar = await currentWar();
	if (!authed.clanId) {
		throw new ExpectedError(translate('noClan', authed));
	}
	const hasRight = await playerHasRightRequest(authed.clanId, authed.id, ClanMemberRight.WAR_OFFICER);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	const attack = await prisma.clanWar.findUnique({
		where: {
			id: +req.params.warId
		},
		select: {
			attackerId: true,
			dateEnd: true,
			points: true,
			attacker: {
				select: {
					id: true,
					leaderId: true,
					clanWarRanking: true
				}
			},
			defenderId: true,
			defender: {
				select: {
					id: true,
					leaderId: true,
					clanWarRanking: true
				}
			}
		}
	});

	if (!attack || attack.dateEnd < new Date()) {
		throw new ExpectedError(translate('noAttack', authed));
	}

	await computeWarResults(attack.attacker, attack.defender, false, true);

	await prisma.clanWar.delete({
		where: {
			id: +req.params.warId
		}
	});
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
