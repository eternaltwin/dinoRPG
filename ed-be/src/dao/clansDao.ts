import { prisma } from '../prisma.js';

import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';
import { ClanHistoryType } from '@drpg/core/models/enums/ClanHistoryType';
import { setSpecificStat } from './trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { CreateClanMessage } from '@drpg/core/models/clan/CreateClanMessage';

export async function getAllClansRequest(page: number) {
	const clans = await prisma.clan.findMany({
		select: {
			id: true,
			name: true,
			creationDate: true,
			leaderId: true,
			treasureValue: true,
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
}

export async function getRankingClansRequest(page: number) {
	const clans = await prisma.clan.findMany({
		select: {
			id: true,
			name: true,
			treasureValue: true
		},
		orderBy: [{ treasureValue: 'desc' }],
		take: 20,
		skip: (page - 1) * 20
	});
	return clans;
}

export async function getClanRequest(id: number) {
	const clans = await prisma.clan.findUnique({
		where: {
			id
		},
		select: {
			id: true,
			name: true,
			members: {
				select: {
					id: true
				}
			},
			creationDate: true,
			war: true,
			leader: {
				select: {
					id: true,
					name: true
				}
			},
			treasureValue: true
		}
	});
	return clans;
}

export async function searchClansByNameRequest(clanName: string, page: number) {
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
}

export async function searchClansByName(clanName: string) {
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
}

export async function createClanRequest(clanName: string, clanDescription: string, playerId: string) {
	const creator = await prisma.player.findUnique({
		where: { id: playerId },
		select: { name: true }
	});

	if (!creator) {
		throw new ExpectedError('Creator not found');
	}
	const clan = await prisma.clan.create({
		data: {
			name: clanName,
			leader: { connect: { id: playerId } }
		},
		select: { id: true }
	});

	await prisma.clanMember.create({
		data: {
			clan: { connect: { id: clan.id } },
			player: { connect: { id: playerId } }
		},
		select: { id: true }
	});

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
}

export async function clanJoinRequest(joinId: number) {
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
					}
				}
			}
		}
	});

	return members;
}

export async function getClanMemberRequest(id: number) {
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
}

export async function getClanMembersListRequest(clanId: number) {
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
					lastLogin: true
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
}

export async function joinClanRequest(clanId: number, playerId: string) {
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
								has: ClanMemberRight[ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS]
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
}

export async function acceptPlayerJoinRequest(requestId: number, acceptorId: string) {
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

	const clanMember = await prisma.clanMember.create({
		data: {
			clan: { connect: { id: joinRequest.clanId } },
			player: { connect: { id: joinRequest.playerId } }
		}
	});

	await prisma.clanHistory.create({
		data: {
			clan: { connect: { id: clanMember.clanId } },
			author: { connect: { id: clanMember.playerId } },
			type: ClanHistoryType[ClanHistoryType.PLAYER_JOIN],
			authorMessage: creator.name
		},
		select: { id: true }
	});

	await setSpecificStat(StatTracking.CLANS, joinRequest.playerId, 1);

	return clanMember;
}

export async function denyPlayerJoinRequest(requestId: number) {
	const joinRequest = await prisma.clanJoinRequest.delete({
		where: {
			id: requestId
		}
	});

	return joinRequest;
}

export async function getPlayerJoinListRequest(clanId: number) {
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
}

export async function getPlayerJoinRequest(playerId: string) {
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
}

export async function deleteClanRequest(clanId: number) {
	await prisma.clanMember.deleteMany({
		where: {
			clanId: clanId
		}
	});

	await prisma.clanHistory.deleteMany({
		where: {
			clanId: clanId
		}
	});

	await prisma.clanMessage.deleteMany({
		where: {
			clanId: clanId
		}
	});
	await prisma.clanPage.deleteMany({
		where: {
			clanId: clanId
		}
	});
	await prisma.clanJoinRequest.deleteMany({
		where: {
			clanId: clanId
		}
	});
	await prisma.clanIngredient.deleteMany({
		where: {
			clanId: clanId
		}
	});
	const clan = await prisma.clan.delete({
		where: {
			id: clanId
		},
		select: { id: true }
	});

	return clan;
}

export async function updateClanBannerRequest(clanId: number, banner: Buffer) {
	const clan = await prisma.clan.update({
		data: {
			banner: banner
		},
		where: {
			id: clanId
		}
	});

	return clan;
}

export async function getClanBannerRequest(clanId: number) {
	const banner = await prisma.clan.findUnique({
		select: {
			banner: true
		},
		where: {
			id: clanId
		}
	});

	return banner;
}

// Return true if player is leader, or has the right.
export async function playerHasRightRequest(clanId: number, playerId: string, right: ClanMemberRight) {
	const member = await prisma.clanMember.count({
		where: {
			OR: [
				{
					clanId,
					playerId,
					rights: {
						has: ClanMemberRight[right]
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
}

export const getClanBannerImage = async (id: number) => {
	const image = await prisma.clan.findUnique({
		where: { id },
		select: { banner: true }
	});

	if (!image) throw new ExpectedError('Banner not found');

	return image;
};

export async function updateClanMemberRequest(id: number, clanId: number, rights: string[], nickname: string) {
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
}

export async function excludeClanMemberRequest(clanMemberId: number, acceptorId: string) {
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

		await prisma.clanHistory.create({
			data: {
				clan: { connect: { id: member.clanId } },
				author: { connect: { id: member.playerId } },
				type: ClanHistoryType[ClanHistoryType.PLAYER_EXCLUSION],
				authorMessage: creator.name
			},
			select: { id: true }
		});
	}

	return member;
}

export async function leaveClanSelfRequest(playerId: string) {
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
		await prisma.clanMember.delete({
			where: {
				playerId
			}
		});

		await prisma.clanHistory.create({
			data: {
				clan: { connect: { id: member.clanId } },
				author: { connect: { id: playerId } },
				type: ClanHistoryType[ClanHistoryType.PLAYER_LEAVE],
				authorMessage: member.player.name
			}
		});
	}

	return member;
}

export async function getClanPagesListRequest(playerId: string, clanId: number) {
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
}

export async function getClanPageRequest(playerId: string, id: number) {
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
}

export async function createClanPageRequest(clanId: number, name: string, content: string, isPublic: boolean) {
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
}

export async function deleteClanPageRequest(id: number) {
	const page = await prisma.clanPage.delete({
		where: {
			id,
			home: false
		},
		select: { id: true }
	});

	return page;
}

export async function updateClanPageRequest(id: number, name: string, content: string, isPublic: boolean) {
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
}

export async function getClanMessagesRequest(playerId: string, clanId: number, page: number) {
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

	return messages;
}

export async function getClanMessagesCountRequest(clanId: number) {
	const messagesCount = prisma.clanMessage.count({
		where: {
			clanId
		}
	});

	return messagesCount;
}

export async function createClanMessageRequest(
	clanId: number,
	authorId: string,
	content: string
): Promise<CreateClanMessage> {
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
					name: true
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
}

export async function deleteClanMessageRequest(id: number, playerId: string): Promise<void> {
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
}

export async function getClanHistoryRequest(playerId: string, clanId: number, page: number) {
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
}

export async function getClanHistoryCountRequest(clanId: number) {
	const historyCount = prisma.clanHistory.count({
		where: {
			clanId
		}
	});

	return historyCount;
}

export async function upsertClanIngredients(clanId: number, ingredientId: number, quantity: number) {
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
}

export async function updateClanTreasure(clanId: number, gold: number) {
	return prisma.clan.update({
		where: {
			id: clanId
		},
		data: {
			treasureValue: { increment: gold }
		}
	});
}

export async function updateClanContribution(memberId: string, gold: number) {
	return prisma.clanMember.update({
		where: {
			playerId: memberId
		},
		data: {
			donation: { increment: gold }
		}
	});
}

export async function getFullClanTreasure(clanId: number) {
	return prisma.clanIngredient.findMany({
		where: {
			clanId: clanId
		},
		select: {
			ingredientId: true,
			quantity: true
		}
	});
}
