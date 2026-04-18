import { CLAN_CREATE_MONEY, CLAN_JOIN_MONEY, CLAN_MAX_MEMBERS_AMOUNT } from '@drpg/core/constants';
import { ClanForSearch, ClanLite, PlayerClanJoinRequest } from '@drpg/core/models/clan/clan';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { NotificationSeverity } from '@drpg/prisma';
import { Request } from 'express';
import { LOGGER } from '../context.js';
import { getDataForMessageDeletion } from '../dao/clanMessageDao.js';
import {
	acceptPlayerJoinRequest,
	clanJoinRequest,
	createClanPageRequest,
	createClanRequest,
	deleteClanPageRequest,
	deleteClanRequest,
	denyPlayerJoinRequest,
	excludeClanMemberRequest,
	getAllClansRequest,
	getClanBannerRequest,
	getClanHistoryCountRequest,
	getClanHistoryRequest,
	getClanMemberRequest,
	getClanMembersListRequest,
	getClanMessagesCountRequest,
	getClanMessagesRequest,
	getClanPageRequest,
	getClanPagesListRequest,
	getEventRankingClansRequest,
	getFullClanTreasure,
	getPlayerJoinListRequest,
	getPlayerJoinRequest,
	getRankingClansRequest,
	joinClanRequest,
	leaveClanSelfRequest,
	playerHasRightRequest,
	searchClansByName,
	searchClansByNameRequest,
	updateClanBannerRequest,
	updateClanContribution,
	updateClanLanguagesRequest,
	updateClanMemberRequest,
	updateClanPageRequest,
	updateClanTreasure,
	upsertClanIngredients
} from '../dao/clansDao.js';
import { createNotification } from '../dao/notificationDao.js';
import { addMoney, auth, removeMoney } from '../dao/playerDao.js';
import { decreaseIngredientQuantity, getAllIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import translate from '../utils/translate.js';
import { canCreateClan, canJoinClan, isPlayerLeaderOfClan } from './playerService.js';
import { JoinClanResponse, JoinRequestListResponse } from '@drpg/core/models/clan/clanJoinRequest';
import { currentEvents } from '@drpg/core/models/event/Events';
import { ClanRankingType } from '@drpg/core/models/rankings/clanRanking';
import { ClanMember } from '@drpg/core/models/clan/clanMember';
import { UpdateClanMemberRequestBody, UpdateClanMemberRequestParams } from '@drpg/core/returnTypes/Clan';
import { prisma } from '../prisma.js';
import { ClanEventConfig } from '@drpg/core/models/clan/clanEventConfig';
import dayjs from 'dayjs';
import { ClanHistoryType } from '@drpg/core/models/enums/ClanHistoryType';
import { scheduleJob } from 'node-schedule';

const WAR_BASE_POINTS = 50;

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

async function currentWar() {
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

	if (!authed.ClanMember) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const hasRight = await playerHasRightRequest(authed.ClanMember.clanId, authed.id, ClanMemberRight.CLAN_BUILD_CASTLE);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	const randomPlace = war.config.warPlaces[Math.round(Math.random() * war.config.warPlaces.length) - 1];

	await prisma.clanCastle.upsert({
		where: {
			clanId: authed.ClanMember.clanId
		},
		create: {
			placeId: randomPlace,
			clanId: authed.ClanMember.clanId
		},
		update: {
			// Do nothing
		}
	});
	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: authed.ClanMember.clanId } },
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

	if (!authed.ClanMember) {
		throw new ExpectedError(translate('noClan', authed));
	}

	const hasRight = await playerHasRightRequest(authed.ClanMember.clanId, authed.id, ClanMemberRight.WAR_OFFICER);

	if (!hasRight) {
		throw new ExpectedError(translate('noRight', authed));
	}

	const attackOngoing = await prisma.clanWar.findUnique({
		where: {
			attackerId: authed.ClanMember.clanId,
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
			id: authed.ClanMember.clanId
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
			attackerId: authed.ClanMember.clanId,
			defenderId: defender.id,
			points
		}
	});

	const notifications: Promise<void>[] = [];
	// Notifications for attackers
	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: authed.ClanMember.clanId } },
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
	const currentClanWar = await currentWar();
	const war = await prisma.clanWar.findUnique({
		where: {
			id: warId
		},
		include: {
			attacker: true,
			defender: true
		}
	});
	if (!war) {
		LOGGER.error(`War ${warId} not found`);
		return;
	}

	// Looser history
	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: war.attackerId } },
			author: { connect: { id: war.attacker.leaderId } },
			type: ClanHistoryType[ClanHistoryType.WAR_LOSE],
			authorMessage: war.attacker.name
		},
		select: { id: true }
	});
	// Looser ranking update
	await prisma.clanWarRanking.upsert({
		where: {
			eventId: currentClanWar.id,
			clanId: war.attacker.id
		},
		update: {
			points: {
				decrement: war.points
			},
			losses: {
				increment: 1
			}
		},
		create: {
			clanId: war.attacker.id,
			eventId: currentClanWar.id,
			points: 1000 - war.points,
			losses: 1
		}
	});

	// Winner history
	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: war.defenderId } },
			author: { connect: { id: war.defender.leaderId } },
			type: ClanHistoryType[ClanHistoryType.WAR_DEFENDED],
			authorMessage: war.defender.name
		},
		select: { id: true }
	});
	// Looser ranking update
	await prisma.clanWarRanking.upsert({
		where: {
			eventId: currentClanWar.id,
			clanId: war.defender.id
		},
		update: {
			points: {
				increment: war.points
			},
			wins: {
				increment: 1
			}
		},
		create: {
			clanId: war.defender.id,
			eventId: currentClanWar.id,
			points: 1000 + war.points,
			wins: 1
		}
	});
}

function computeWarPointsDelta(attackerPoints: number, defenderPoints: number) {
	const totalPoints = attackerPoints + defenderPoints || 1;
	// Part relative du défenseur (entre 0 et 1)
	const defenderWeight = defenderPoints / totalPoints;

	// Plus le défenseur est fort, plus la victoire de l'attaquant rapporte
	const attackerGain = Math.round(WAR_BASE_POINTS * defenderWeight * 2);

	return Math.max(10, Math.min(150, attackerGain));
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
		scheduleJob(`attack_${war.id}`, war.dateEnd!, () => {
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
