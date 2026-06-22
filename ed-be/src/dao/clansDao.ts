import { prisma } from '../prisma.js';

import { CreateClanMessage } from '@drpg/core/models/clan/CreateClanMessage';
import { ClanHistoryType } from '@drpg/core/models/enums/ClanHistoryType';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { currentEvents } from '@drpg/core/models/event/Events';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Lang, NotificationSeverity, EventType, $Enums, Prisma, LogType } from '@drpg/prisma';
import { setSpecificStat } from './trackingDao.js';
import { createNotification } from './notificationDao.js';
import { withSpan } from '../utils/server/tracing.js';
import { ProspectorUpdate, WarRankingUpdate } from '../utils/warCalculation.js';
import ClanEventType = $Enums.ClanEventType;
import { WarCost } from '@drpg/core/models/clan/clanWar';

export async function getAllClansRequest(page: number) {
	return withSpan(getAllClansRequest.name, async () => {
		const clans = await prisma.clan.findMany({
			select: {
				id: true,
				name: true,
				creationDate: true,
				leaderId: true,
				treasureValue: true,
				langs: true,
				members: {
					select: {
						id: true
					}
				},
				leader: {
					select: {
						id: true,
						name: true
					}
				}
			},
			orderBy: [{ creationDate: 'desc' }],
			take: 20,
			skip: (page - 1) * 20
		});
		return clans;
	});
}

export async function getRankingClansRequest(page: number) {
	return withSpan(getRankingClansRequest.name, async () => {
		const clans = await prisma.clan.findMany({
			select: {
				id: true,
				name: true,
				treasureValue: true,
				langs: true
			},
			orderBy: [{ treasureValue: 'desc' }],
			take: 20,
			skip: (page - 1) * 20
		});
		return clans;
	});
}

export async function getRankingWarClansRequest(page: number) {
	return withSpan(getRankingWarClansRequest.name, async () => {
		const now = new Date();

		const currentEvent = await prisma.clanEvent.findFirst({
			where: {
				startDate: { lte: now },
				endDate: { gte: now },
				eventType: ClanEventType.war
			},
			select: { id: true }
		});

		if (!currentEvent) return [];

		const rankings = await prisma.clanWarRanking.findMany({
			where: {
				eventId: currentEvent.id
			},
			select: {
				reputation: true,
				clan: {
					select: {
						id: true,
						name: true,
						treasureValue: true,
						creationDate: true,
						leaderId: true,
						langs: true,
						members: {
							select: { id: true }
						},
						leader: {
							select: { id: true, name: true }
						},
						castle: {
							select: { currentLife: true }
						}
					}
				}
			},
			orderBy: { reputation: 'desc' },
			take: 20,
			skip: (page - 1) * 20
		});

		// Reformater pour correspondre à ClanLite
		return rankings.map(ranking => {
			const { castle, ...clanWithoutCastle } = ranking.clan;
			return {
				...clanWithoutCastle,
				isCastleBuilt: (castle?.currentLife ?? 0) > 0,
				clanWarRanking: { reputation: Math.round(ranking.reputation) }
			};
		});
	});
}

export async function getEventRankingClansRequest(page: number, event: EventType) {
	return withSpan(getEventRankingClansRequest.name, async () => {
		const topClans: {
			id: number;
			name: string;
			treasureValue: number;
			langs: Lang[];
			totalScore: bigint;
		}[] = await prisma.$queryRaw`
    SELECT
      c.id,
      c.name,
      c."treasureValue",
      c.langs,
      SUM(e."totalProgression") as "totalScore"
    FROM "Clan" c
    INNER JOIN "ClanMember" cm ON c.id = cm."clanId"
    INNER JOIN "Events" e ON cm."playerId" = e."playerId"
    WHERE e.event = ${event}::"EventType"
    GROUP BY c.id, c.name
    ORDER BY "totalScore" DESC
    LIMIT 20
    OFFSET ${(page - 1) * 20};
  `;
		return topClans.map(clan => ({
			...clan,
			totalScore: Number(clan.totalScore)
		}));
	});
}

export async function getClanRequestPublic(id: number) {
	return withSpan(getClanRequestPublic.name, async () => {
		const clans = await prisma.clan.findUnique({
			where: {
				id
			},
			select: {
				id: true,
				name: true,
				langs: true,
				members: {
					select: {
						playerId: true,
						id: true
					}
				},
				creationDate: true,
				attackingWars: true,
				defendingWars: true,
				leader: {
					select: {
						id: true,
						name: true
					}
				},
				treasureValue: true,
				clanWarRanking: {
					select: {
						reputation: true
					}
				}
			}
		});
		return clans;
	});
}

export async function getClanRequestPrivate(id: number) {
	return withSpan(getClanRequestPrivate.name, async () => {
		const clans = await prisma.clan.findUnique({
			where: {
				id
			},
			select: {
				id: true,
				name: true,
				langs: true,
				members: {
					select: {
						playerId: true,
						id: true
					}
				},
				creationDate: true,
				castle: true,
				attackingWars: true,
				defendingWars: true,
				leader: {
					select: {
						id: true,
						name: true
					}
				},
				treasureValue: true,
				clanWarRanking: {
					select: {
						reputation: true
					}
				},
				ingredients: {
					select: {
						ingredientId: true,
						quantity: true
					}
				}
			}
		});
		return clans;
	});
}

export async function searchClansByNameRequest(clanName: string, page: number) {
	return withSpan(searchClansByNameRequest.name, async () => {
		const clans = await prisma.clan.findMany({
			where: {
				name: {
					contains: clanName,
					mode: 'insensitive'
				}
			},
			select: {
				id: true,
				name: true,
				treasureValue: true,
				leaderId: true,
				langs: true,
				members: {
					select: {
						id: true
					}
				},
				creationDate: true,
				leader: {
					select: {
						id: true,
						name: true
					}
				}
			},
			orderBy: [{ creationDate: 'desc' }],
			take: 20,
			skip: (page - 1) * 20
		});

		return clans;
	});
}

export async function searchClansByName(clanName: string) {
	return withSpan(searchClansByName.name, async () => {
		const clans = await prisma.clan.findMany({
			where: {
				name: {
					contains: clanName,
					mode: 'insensitive'
				}
			},
			select: {
				id: true,
				name: true
			}
		});

		return clans;
	});
}

export async function createClanRequest(
	clanName: string,
	clanDescription: string,
	clanLangs: Lang[],
	playerId: string
) {
	return withSpan(createClanRequest.name, async () => {
		const creator = await prisma.player.findUnique({
			where: { id: playerId },
			select: {
				name: true,
				ClanJoinRequest: true
			}
		});

		if (!creator) {
			throw new ExpectedError('Creator not found');
		}

		// Delete existing request for the player as well if there is any.
		if (creator.ClanJoinRequest) {
			await prisma.clanJoinRequest.delete({
				where: {
					id: creator.ClanJoinRequest.id
				}
			});
		}

		const clan = await prisma.clan.create({
			data: {
				name: clanName,
				langs: clanLangs,
				leader: { connect: { id: playerId } }
			},
			select: { id: true }
		});

		await prisma.$transaction([
			prisma.clanMember.create({
				data: {
					clan: { connect: { id: clan.id } },
					player: { connect: { id: playerId } }
				},
				select: { id: true }
			}),
			prisma.player.update({
				where: { id: playerId },
				data: { clanId: clan.id } // ← ajout
			})
		]);

		await prisma.clanHistory.create({
			data: {
				clan: { connect: { id: clan.id } },
				author: { connect: { id: playerId } },
				type: ClanHistoryType[ClanHistoryType.CLAN_CREATED],
				authorMessage: creator.name
			},
			select: { id: true }
		});

		await prisma.clanPage.create({
			data: {
				Clan: { connect: { id: clan.id } },
				public: true,
				home: true,
				name: 'Home',
				content: clanDescription
			},
			select: { id: true }
		});

		await setSpecificStat(StatTracking.CLANS, playerId, 1);
		return clan;
	});
}

export async function clanJoinRequest(joinId: number) {
	return withSpan(clanJoinRequest.name, async () => {
		const members = await prisma.clanJoinRequest.findUnique({
			where: {
				id: joinId
			},
			select: {
				clanId: true,
				playerId: true,
				clan: {
					select: {
						_count: {
							select: {
								members: true
							}
						},
						name: true,
						id: true
					}
				}
			}
		});

		return members;
	});
}

export async function getClanMemberRequest(id: number) {
	return withSpan(getClanMemberRequest.name, async () => {
		const members = await prisma.clanMember.findUnique({
			where: {
				id
			},
			select: {
				id: true,
				nickname: true,
				rights: true,
				player: {
					select: {
						name: true,
						id: true
					}
				}
			}
		});

		return members;
	});
}

export async function getClanMembersListRequest(clanId: number) {
	return withSpan(getClanMembersListRequest.name, async () => {
		const event = currentEvents()[0];
		const members = await prisma.clanMember.findMany({
			where: {
				clanId
			},
			select: {
				id: true,
				nickname: true,
				rights: true,
				donation: true,
				playerId: true,
				player: {
					select: {
						id: true,
						name: true,
						leaderOf: {
							select: {
								id: true
							}
						},
						lastLogin: true,
						Events: {
							select: {
								totalProgression: true
							},
							where: {
								event: event?.name
							}
						}
					}
				},
				clan: {
					select: {
						id: true
					}
				}
			},
			orderBy: {
				id: 'asc'
			}
		});

		return members;
	});
}

export async function joinClanRequest(clanId: number, playerId: string) {
	return withSpan(joinClanRequest.name, async () => {
		const joinRequest = await prisma.clanJoinRequest.create({
			data: {
				player: { connect: { id: playerId } },
				clan: { connect: { id: clanId } }
			},
			select: {
				id: true,
				clan: {
					select: {
						id: true,
						name: true,
						leaderId: true,
						members: {
							select: {
								playerId: true,
								rights: true
							},
							where: {
								rights: {
									has: ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS
								}
							}
						}
					}
				},
				player: { select: { id: true, name: true } },
				date: true
			}
		});

		return joinRequest;
	});
}

export async function acceptPlayerJoinRequest(requestId: number, acceptorId: string) {
	return withSpan(acceptPlayerJoinRequest.name, async () => {
		const creator = await prisma.player.findUnique({
			where: { id: acceptorId },
			select: { name: true }
		});

		if (!creator) {
			throw new ExpectedError('Creator not found');
		}
		const joinRequest = await prisma.clanJoinRequest.delete({
			where: {
				id: requestId
			}
		});

		const [clanMember] = await prisma.$transaction([
			prisma.clanMember.create({
				data: {
					clan: { connect: { id: joinRequest.clanId } },
					player: { connect: { id: joinRequest.playerId } }
				},
				select: {
					id: true,
					nickname: true,
					dateJoin: true,
					rights: true,
					donation: true,
					player: {
						select: {
							id: true,
							name: true,
							lastLogin: true,
							leaderOf: { select: { id: true } },
							Events: { select: { totalProgression: true } }
						}
					},
					clan: { select: { id: true, name: true } }
				}
			}),
			prisma.player.update({
				where: { id: joinRequest.playerId },
				data: { clanId: joinRequest.clanId } // ← ajout
			})
		]);

		await prisma.clanHistory.create({
			data: {
				clan: { connect: { id: clanMember.clan.id } },
				author: { connect: { id: clanMember.player.id } },
				type: ClanHistoryType[ClanHistoryType.PLAYER_JOIN],
				authorMessage: creator.name
			},
			select: { id: true }
		});

		await setSpecificStat(StatTracking.CLANS, joinRequest.playerId, 1);
		await createNotification(
			joinRequest.playerId,
			clanMember.clan.name,
			NotificationSeverity.clanApplyAccepted,
			`/clan/${clanMember.clan.id}`
		);

		return clanMember;
	});
}

export async function denyPlayerJoinRequest(requestId: number) {
	return withSpan(denyPlayerJoinRequest.name, async () => {
		const joinRequest = await prisma.clanJoinRequest.delete({
			where: {
				id: requestId
			}
		});

		return joinRequest;
	});
}

export async function getPlayerJoinListRequest(clanId: number) {
	return withSpan(getPlayerJoinListRequest.name, async () => {
		const joinRequestsList = await prisma.clanJoinRequest.findMany({
			where: {
				clanId
			},
			select: {
				id: true,
				date: true,
				player: {
					select: {
						id: true,
						name: true
					}
				}
			}
		});

		return joinRequestsList;
	});
}

export async function getPlayerJoinRequest(playerId: string) {
	return withSpan(getPlayerJoinRequest.name, async () => {
		const joinRequest = await prisma.clanJoinRequest.findFirst({
			where: {
				playerId
			},
			select: {
				id: true,
				date: true,
				player: {
					select: {
						id: true,
						name: true
					}
				},
				clan: {
					select: {
						id: true,
						name: true,
						leaderId: true,
						members: {
							select: {
								playerId: true,
								rights: true
							}
						}
					}
				}
			}
		});

		return joinRequest;
	});
}

export async function deleteClanRequest(clanId: number) {
	return withSpan(deleteClanRequest.name, async () => {
		await prisma.$transaction([
			prisma.player.updateMany({
				where: { clanId: clanId },
				data: { clanId: null } // ← ajout
			}),
			prisma.clanMember.deleteMany({ where: { clanId } }),
			prisma.clanHistory.deleteMany({ where: { clanId } }),
			prisma.clanMessage.deleteMany({ where: { clanId } }),
			prisma.clanPage.deleteMany({ where: { clanId } }),
			prisma.clanJoinRequest.deleteMany({ where: { clanId } }),
			prisma.clanIngredient.deleteMany({ where: { clanId } }),
			prisma.clanWar.deleteMany({
				where: {
					OR: [{ attackerClanId: clanId }, { defenderClanId: clanId }]
				}
			}),
			prisma.clanCastle.deleteMany({ where: { clanId } }),
			prisma.clan.delete({ where: { id: clanId } })
		]);
	});
}

export async function updateClanLanguagesRequest(clanId: number, langs: Lang[]) {
	return withSpan(updateClanLanguagesRequest.name, async () => {
		const clan = await prisma.clan.update({
			data: {
				langs
			},
			where: {
				id: clanId
			}
		});

		return clan;
	});
}

export async function updateClanBannerRequest(clanId: number, banner: Buffer) {
	return withSpan(updateClanBannerRequest.name, async () => {
		const clan = await prisma.clan.update({
			data: {
				banner: banner
			},
			where: {
				id: clanId
			}
		});

		return clan;
	});
}

export async function getClanBannerRequest(clanId: number) {
	return withSpan(getClanBannerRequest.name, async () => {
		const banner = await prisma.clan.findUnique({
			select: {
				banner: true
			},
			where: {
				id: clanId
			}
		});

		return banner;
	});
}

// Return true if player is leader, or has the right.
export async function playerHasRightRequest(clanId: number, playerId: string, right: ClanMemberRight) {
	return withSpan(playerHasRightRequest.name, async () => {
		const member = await prisma.clanMember.count({
			where: {
				OR: [
					{
						clanId,
						playerId,
						rights: {
							has: right
						}
					},
					{
						clanId,
						playerId,
						clan: {
							leader: {
								id: playerId
							}
						}
					}
				]
			}
		});

		return member > 0;
	});
}

export const getClanBannerImage = async (id: number) => {
	return withSpan(getClanBannerImage.name, async () => {
		const image = await prisma.clan.findUnique({
			where: { id },
			select: { banner: true }
		});

		if (!image) throw new ExpectedError('Banner not found');

		return image;
	});
};

export async function updateClanMemberRequest(id: number, clanId: number, rights: string[], nickname: string | null) {
	return withSpan(updateClanMemberRequest.name, async () => {
		const member = await prisma.clanMember.update({
			where: {
				id,
				clanId
			},
			data: {
				rights,
				nickname
			}
		});

		return member;
	});
}

export async function excludeClanMemberRequest(clanMemberId: number, acceptorId: string) {
	return withSpan(excludeClanMemberRequest.name, async () => {
		const creator = await prisma.player.findUnique({
			where: { id: acceptorId },
			select: { name: true }
		});

		if (!creator) {
			throw new ExpectedError('Creator not found');
		}
		let member = await prisma.clanMember.findUnique({
			where: {
				id: clanMemberId
			}
		});

		const clan = await prisma.clan.findUnique({
			where: {
				id: member?.clanId
			}
		});

		if (clan?.leaderId != member?.playerId) {
			member = await prisma.clanMember.delete({
				where: {
					id: clanMemberId
				}
			});

			await prisma.$transaction([
				prisma.player.update({
					where: { id: member.playerId },
					data: { clanId: null }
				}),
				prisma.clanHistory.create({
					data: {
						clan: { connect: { id: member.clanId } },
						author: { connect: { id: member.playerId } },
						type: ClanHistoryType[ClanHistoryType.PLAYER_EXCLUSION],
						authorMessage: creator.name
					},
					select: { id: true }
				})
			]);
		}

		return member;
	});
}

export async function leaveClanSelfRequest(playerId: string) {
	return withSpan(leaveClanSelfRequest.name, async () => {
		const member = await prisma.clanMember.findUnique({
			where: {
				playerId
			},
			select: {
				id: true,
				clanId: true,
				playerId: true,
				dateJoin: true,
				rights: true,
				nickname: true,
				donation: true,
				player: {
					select: {
						name: true
					}
				}
			}
		});

		if (!member) {
			throw new ExpectedError('Member not found');
		}

		const clan = await prisma.clan.findUnique({
			where: {
				id: member.clanId
			}
		});

		if (clan?.leaderId != member.playerId) {
			const castle = await prisma.clanCastle.findUnique({
				where: { clanId: member.clanId },
				select: { id: true, defenseOrder: true }
			});

			const dinozToUnassign = await prisma.dinoz.findMany({
				where: { playerId: playerId, castleId: { not: null } },
				select: { id: true }
			});

			const transactions: Prisma.PrismaPromise<any>[] = [
				prisma.clanMember.delete({ where: { playerId } }),
				prisma.player.update({
					where: { id: playerId },
					data: { clanId: null }
				}),
				prisma.clanHistory.create({
					data: {
						clan: { connect: { id: member.clanId } },
						author: { connect: { id: playerId } },
						type: ClanHistoryType[ClanHistoryType.PLAYER_LEAVE],
						authorMessage: member.player.name
					}
				})
			];

			if (castle && dinozToUnassign.length > 0) {
				const dinozIds = dinozToUnassign.map(d => d.id);
				transactions.push(
					prisma.clanCastle.update({
						where: { id: castle.id },
						data: {
							defenseOrder: {
								set: castle.defenseOrder.filter(id => !dinozIds.includes(id))
							}
						}
					}),
					prisma.dinoz.updateMany({
						where: { id: { in: dinozIds } },
						data: { castleId: null, unavailableReason: null }
					})
				);
			}

			await prisma.$transaction(transactions);
		}

		return member;
	});
}

export async function getClanPagesListRequest(playerId: string, clanId: number) {
	return withSpan(getClanPagesListRequest.name, async () => {
		const player = await prisma.clanMember.count({
			where: {
				playerId,
				clanId
			}
		});

		let pages = null;

		if (player > 0) {
			pages = await prisma.clanPage.findMany({
				where: {
					clanId
				},
				select: {
					id: true,
					name: true,
					public: true,
					home: true
				}
			});
		} else {
			pages = await prisma.clanPage.findMany({
				where: {
					clanId,
					public: true
				},
				select: {
					id: true,
					name: true,
					public: true,
					home: true
				}
			});
		}

		return pages;
	});
}

export async function getClanPageRequest(playerId: string, id: number) {
	return withSpan(getClanPageRequest.name, async () => {
		const page = await prisma.clanPage.findUnique({
			where: {
				id
			}
		});

		let hasAccess = true;

		if (!page?.public) {
			const player = await prisma.clanMember.count({
				where: {
					playerId,
					clanId: page?.clanId
				}
			});
			hasAccess = player > 0;
		}

		return hasAccess ? page : null;
	});
}

export async function createClanPageRequest(clanId: number, name: string, content: string, isPublic: boolean) {
	return withSpan(createClanPageRequest.name, async () => {
		const page = await prisma.clanPage.create({
			data: {
				Clan: { connect: { id: clanId } },
				public: isPublic,
				home: false,
				name,
				content
			},
			select: { id: true }
		});

		return page;
	});
}

export async function deleteClanPageRequest(id: number) {
	return withSpan(deleteClanPageRequest.name, async () => {
		const page = await prisma.clanPage.delete({
			where: {
				id,
				home: false
			},
			select: { id: true }
		});

		return page;
	});
}

export async function updateClanPageRequest(id: number, name: string, content: string, isPublic: boolean) {
	return withSpan(updateClanPageRequest.name, async () => {
		const page = await prisma.clanPage.update({
			where: {
				id
			},
			data: {
				name,
				content,
				public: isPublic
			}
		});

		return page;
	});
}

export async function getClanMessagesRequest(playerId: string, clanId: number, page: number) {
	return withSpan(getClanMessagesRequest.name, async () => {
		const player = await prisma.clanMember.count({
			where: {
				playerId,
				clanId
			}
		});

		let messages = null;

		if (player > 0) {
			messages = await prisma.clanMessage.findMany({
				where: {
					clanId
				},
				orderBy: {
					date: 'desc'
				},
				select: {
					id: true,
					date: true,
					content: true,
					author: {
						select: {
							id: true,
							name: true,
							playerTracking: {
								select: {
									stat: true,
									quantity: true
								}
							}
						}
					},
					clan: {
						select: {
							leaderId: true
						}
					}
				},
				take: 20,
				skip: (page - 1) * 20
			});
		}

		return messages;
	});
}

export async function getClanMessagesCountRequest(clanId: number) {
	return withSpan(getClanMessagesCountRequest.name, async () => {
		const messagesCount = prisma.clanMessage.count({
			where: {
				clanId
			}
		});

		return messagesCount;
	});
}

export async function createClanMessageRequest(
	clanId: number,
	authorId: string,
	content: string
): Promise<CreateClanMessage> {
	return withSpan(createClanMessageRequest.name, async () => {
		const creator = await prisma.player.findUnique({
			where: { id: authorId },
			select: { name: true }
		});

		if (!creator) {
			throw new ExpectedError('Creator not found');
		}

		const message = await prisma.clanMessage.create({
			data: {
				clan: { connect: { id: clanId } },
				author: { connect: { id: authorId } },
				authorName: creator.name,
				content
			},
			select: {
				id: true,
				date: true,
				content: true,
				authorName: true,
				author: {
					select: {
						id: true,
						name: true,
						playerTracking: true
					}
				},
				clan: {
					select: {
						leaderId: true
					}
				}
			}
		});

		return message;
	});
}

export async function deleteClanMessageRequest(id: number, playerId: string): Promise<void> {
	return withSpan(deleteClanMessageRequest.name, async () => {
		await prisma.clanMessage.delete({
			where: {
				id,
				OR: [
					{
						authorId: playerId
					},
					{
						clan: {
							leaderId: playerId
						}
					}
				]
			}
		});
	});
}

export async function getClanHistoryRequest(playerId: string, clanId: number, page: number) {
	return withSpan(getClanHistoryRequest.name, async () => {
		const player = await prisma.clanMember.count({
			where: {
				playerId,
				clanId
			}
		});

		let history = null;

		if (player > 0) {
			history = await prisma.clanHistory.findMany({
				where: {
					clanId
				},
				orderBy: {
					date: 'desc'
				},
				select: {
					id: true,
					date: true,
					type: true,
					authorMessage: true,
					author: {
						select: {
							id: true,
							name: true
						}
					},
					clan: {
						select: {
							leaderId: true
						}
					}
				},
				take: 20,
				skip: (page - 1) * 20
			});
		}

		return history;
	});
}

export async function getClanHistoryCountRequest(clanId: number) {
	return withSpan(getClanHistoryCountRequest.name, async () => {
		const historyCount = prisma.clanHistory.count({
			where: {
				clanId
			}
		});

		return historyCount;
	});
}

export async function upsertClanIngredients(clanId: number, ingredientId: number, quantity: number) {
	return withSpan(upsertClanIngredients.name, async () => {
		return prisma.clanIngredient.upsert({
			where: { ingredientId_clanId: { ingredientId, clanId } },
			update: {
				quantity: { increment: quantity }
			},
			create: {
				ingredientId: ingredientId,
				quantity: quantity,
				clanId: clanId
			}
		});
	});
}

export async function updateClanTreasure(clanId: number, gold: number) {
	return withSpan(updateClanTreasure.name, async () => {
		return prisma.clan.update({
			where: {
				id: clanId
			},
			data: {
				treasureValue: { increment: gold }
			}
		});
	});
}

export async function updateClanContribution(memberId: string, gold: number) {
	return withSpan(updateClanContribution.name, async () => {
		return prisma.clanMember.update({
			where: {
				playerId: memberId
			},
			data: {
				donation: { increment: gold }
			}
		});
	});
}

export async function getFullClanTreasure(clanId: number) {
	return withSpan(getFullClanTreasure.name, async () => {
		return prisma.clanIngredient.findMany({
			where: {
				clanId: clanId
			},
			select: {
				ingredientId: true,
				quantity: true
			}
		});
	});
}

export async function updateClanName(clanId: number, name: string) {
	return withSpan(updateClanName.name, async () => {
		return await prisma.clan.update({
			where: { id: clanId },
			data: { name: name }
		});
	});
}

export async function updateClanLeader(clanId: number, newLeaderId: string) {
	return withSpan(updateClanLeader.name, async () => {
		return await prisma.clan.update({
			where: { id: clanId },
			data: { leaderId: newLeaderId }
		});
	});
}

export async function deleteClanMember(playerId: string) {
	return withSpan(deleteClanMember.name, async () => {
		const [member] = await prisma.$transaction([
			prisma.clanMember.delete({ where: { playerId } }),
			prisma.player.update({
				where: { id: playerId },
				data: { clanId: null } // ← ajout
			})
		]);
		return member;
	});
}

export type ResolvedWar = NonNullable<Awaited<ReturnType<typeof getWarForResolve>>>;
export async function getWarForResolve(warId: string) {
	return withSpan(getWarForResolve.name, async () => {
		return prisma.clanWar.findUnique({
			where: { id: warId, winnerClanId: null },
			select: {
				id: true,
				eventId: true,
				attacker: {
					select: {
						id: true,
						leaderId: true,
						clanWarRanking: true,
						name: true,
						members: {
							select: {
								playerId: true
							}
						}
					}
				},
				defender: {
					select: {
						id: true,
						leaderId: true,
						clanWarRanking: true,
						name: true,
						members: {
							select: {
								playerId: true
							}
						}
					}
				},
				isCastleDestroyed: true
			}
		});
	});
}

export async function updateWarRankings(eventId: string, updates: WarRankingUpdate[]) {
	return withSpan(updateWarRankings.name, async () => {
		if (updates.length === 0) {
			return;
		}

		await prisma.$transaction(
			updates.map(({ clanId, totalPWin, totalPLost, downtimeCount, reputation }) =>
				prisma.clanWarRanking.update({
					where: { clanId_eventId: { clanId, eventId } },
					data: { totalPWin, totalPLost, downtimeCount, reputation }
				})
			)
		);
	});
}

/**
 * Fetches every war-ranking row of an event together with its clan's castle life (to decide the
 * standing/destroyed state) and member ids (to target the Prospector SSE notification).
 */
export async function getProspectorRankings(eventId: string) {
	return withSpan(getProspectorRankings.name, async () => {
		return prisma.clanWarRanking.findMany({
			where: { eventId },
			select: {
				clanId: true,
				totalPWin: true,
				totalPLost: true,
				downtimeCount: true,
				reputation: true,
				castleStandingStreak: true,
				castleDownStreak: true,
				clan: {
					select: {
						castle: { select: { currentLife: true } },
						members: { select: { playerId: true } }
					}
				}
			}
		});
	});
}

/**
 * Persists a batch of Prospector updates. Writes only the fields the Prospector owns —
 * `downtimeCount` is intentionally left untouched (owned by war resolution) to avoid clobbering a
 * concurrent `updateWarRankings`.
 */
export async function applyProspectorUpdates(eventId: string, updates: ProspectorUpdate[]) {
	return withSpan(applyProspectorUpdates.name, async () => {
		if (updates.length === 0) {
			return;
		}

		await prisma.$transaction(
			updates.map(({ clanId, totalPWin, totalPLost, reputation, castleStandingStreak, castleDownStreak }) =>
				prisma.clanWarRanking.update({
					where: { clanId_eventId: { clanId, eventId } },
					data: { totalPWin, totalPLost, reputation, castleStandingStreak, castleDownStreak }
				})
			)
		);
	});
}

// Transaction client matching the local (extended) prisma client, usable both standalone and inside $transaction.
type LocalTransactionClient = Omit<
	typeof prisma,
	'$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function checkCanDeclareWar(attackerClanId: number, tx: LocalTransactionClient = prisma): Promise<void> {
	return withSpan(checkCanDeclareWar.name, async () => {
		const activeWar = await tx.clanWar.findFirst({
			where: {
				attackerClanId,
				winnerClanId: null
			}
		});
		if (activeWar) {
			throw new ExpectedError('alreadyAtWar');
		}
	});
}

export async function consumeWarCost(clanId: number, cost: NonNullable<WarCost>, tx: LocalTransactionClient = prisma) {
	return withSpan(consumeWarCost.name, async () => {
		const totalValue = cost.totalValue;

		for (const { ingredientId, quantity } of cost.ingredients) {
			await tx.clanIngredient.update({
				where: {
					ingredientId_clanId: { ingredientId, clanId }
				},
				data: {
					quantity: { decrement: quantity }
				}
			});
		}
		await tx.clan.update({
			where: { id: clanId },
			data: {
				treasureValue: { decrement: totalValue }
			}
		});
	});
}

export async function consumeRepairCost(clanId: number, cost: NonNullable<WarCost>) {
	return withSpan(consumeRepairCost.name, async () => {
		await prisma.$transaction([
			...cost.ingredients.map(({ ingredientId, quantity }) =>
				prisma.clanIngredient.update({
					where: {
						ingredientId_clanId: { ingredientId, clanId }
					},
					data: {
						quantity: { decrement: quantity }
					}
				})
			),
			prisma.clan.update({
				where: { id: clanId },
				data: {
					treasureValue: { decrement: cost.totalValue }
				}
			})
		]);
	});
}

export async function getWarHistory(page: number) {
	const wars = await prisma.clanWar.findMany({
		orderBy: { startedAt: 'desc' },
		skip: (page - 1) * 20,
		take: 20,
		select: {
			id: true,
			startedAt: true,
			winnerClanId: true,
			attackerClanId: true,
			isCastleDestroyed: true,
			attacker: { select: { id: true, name: true } },
			defender: { select: { id: true, name: true } }
		}
	});

	const resolvedWarIds = wars.filter(w => w.winnerClanId !== null).map(w => w.id);
	const logs =
		resolvedWarIds.length > 0
			? await prisma.log.findMany({
					where: { type: LogType.ClanWarResolved, values: { hasSome: resolvedWarIds } }
				})
			: [];

	const logReasonByWarId = new Map<string, string>();
	for (const log of logs) {
		if (!logReasonByWarId.has(log.values[0])) logReasonByWarId.set(log.values[0], log.values[2]);
	}

	return wars.map(w => {
		let endReason: string | null = null;
		if (w.winnerClanId !== null) {
			const logReason = logReasonByWarId.get(w.id);
			if (logReason) {
				endReason = logReason;
			} else if (w.isCastleDestroyed) {
				endReason = 'castleDestroyed';
			} else if (w.winnerClanId === w.attackerClanId) {
				endReason = 'castleDestroyed';
			} else {
				// No log and castle not destroyed: could be timeout, forfeit, or stolen.
				// Without logs we cannot distinguish — default to expiration.
				endReason = 'expiration';
			}
		}
		return {
			id: w.id,
			startedAt: w.startedAt,
			attacker: w.attacker,
			defender: w.defender,
			endReason
		};
	});
}
