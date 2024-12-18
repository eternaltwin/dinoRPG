import { prisma } from '../prisma.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export async function getConversationsWithPlayer(playerId: string) {
	return await prisma.conversation.findMany({
		where: {
			participants: {
				some: {
					playerId: playerId
				}
			}
		},
		select: {
			title: true,
			id: true,
			createdById: true,
			createdBy: {
				select: {
					name: true
				}
			},
			participants: {
				select: {
					playerId: true
				}
			},
			updatedAt: true
		},
		orderBy: [{ updatedAt: 'desc' }]
	});
}

export async function createConversation(
	creatorId: string,
	participants: string[],
	title: string,
	firstMessageContent: string
) {
	// Récupérer le nom du créateur
	const creator = await prisma.player.findUnique({
		where: { id: creatorId },
		select: { name: true }
	});

	if (!creator) {
		throw new ExpectedError('Creator not found');
	}

	// Récupérer les noms des autres participants
	const participantNames = await prisma.player.findMany({
		where: { id: { in: participants } },
		select: { id: true, name: true }
	});

	const conv = await prisma.conversation.create({
		data: {
			title: title,
			createdBy: {
				connect: { id: creatorId }
			},
			createdByName: creator.name,
			participants: {
				create: [
					{
						player: { connect: { id: creatorId } },
						playerName: creator.name // Ajouter explicitement playerName
					},
					...participantNames.map(participant => ({
						player: { connect: { id: participant.id } },
						playerName: participant.name // Ajouter explicitement playerName
					}))
				]
			},
			messages: {
				create: {
					content: firstMessageContent,
					sender: { connect: { id: creatorId } },
					senderName: creator.name
				}
			}
		},
		select: {
			id: true,
			createdBy: {
				select: {
					id: true,
					name: true
				}
			},
			participants: true,
			title: true,
			updatedAt: true
		}
	});

	return conv;
}

/*export async function addToConversation(conversationId: string, participants: string[]) {
	await prisma.conversation.update({
		data: {
			participants: {
				create: [
					...participants.map(id => ({
						player: { connect: { id } }
					}))
				]
			}
		},
		where: {
			id: conversationId
		}
	});
}*/

export async function removeFromConversation(conversationId: string, participants: string[]) {
	await prisma.participants.deleteMany({
		where: {
			conversationId: conversationId,
			playerId: {
				in: participants // Retire les joueurs dont les IDs sont dans le tableau
			}
		}
	});
}

export async function getConversation(conversationId: string) {
	return prisma.conversation.findUniqueOrThrow({
		where: {
			id: conversationId
		},
		select: {
			title: true,
			id: true,
			createdById: true,
			pinnedMessage: true,

			participants: {
				select: {
					player: {
						select: {
							id: true,
							name: true
						}
					},
					playerName: true
				}
			},
			messages: {
				take: 10,
				select: {
					id: true,
					content: true,
					createdAt: true,
					sender: {
						select: {
							id: true,
							name: true
						}
					}
				},
				orderBy: [{ id: 'desc' }]
			},
			updatedAt: true
		}
	});
}

/*export async function getMoreMessages(conversationId: string, page: number) {
	const skip = (page - 1) * 10;
	const take = 10;

	return await prisma.conversation.findUniqueOrThrow({
		where: {
			id: conversationId
		},
		select: {
			participants: {
				select: {
					playerId: true
				}
			},
			messages: {
				take: 10,
				select: {
					id: true,
					content: true,
					createdAt: true,
					sender: {
						select: {
							id: true,
							name: true
						}
					}
				},
				orderBy: [{ id: 'desc' }]
			}
		}
	});
}*/

export async function getMoreMessages(conversationId: string, page: number) {
	const skip = (page - 1) * 10;
	const take = 10;

	return prisma.conversation.findUniqueOrThrow({
		where: {
			id: conversationId
		},
		select: {
			participants: {
				select: {
					playerId: true
				}
			},
			messages: {
				skip: skip,
				take: take,
				select: {
					id: true,
					content: true,
					createdAt: true,
					sender: {
						select: {
							id: true,
							name: true
						}
					}
				},
				orderBy: [{ id: 'desc' }]
			}
		}
	});
}

export async function addMessage(conversationId: string, message: string, senderId: string) {
	const sender = await prisma.player.findUnique({
		where: { id: senderId },
		select: { name: true }
	});

	if (!sender) {
		throw new ExpectedError('Sender not found');
	}
	return prisma.conversation.update({
		data: {
			messages: {
				create: {
					content: message,
					sender: {
						connect: {
							id: senderId
						}
					},
					senderName: sender.name
				}
			},
			updatedAt: new Date()
		},
		where: {
			id: conversationId
		},
		select: {
			messages: {
				take: 10,
				select: {
					id: true,
					content: true,
					createdAt: true,
					sender: {
						select: {
							id: true,
							name: true
						}
					}
				},
				orderBy: [{ id: 'desc' }]
			}
		}
	});
}

export async function changePinMessage(conversationId: string, pin: number | null) {
	await prisma.conversation.update({
		where: {
			id: conversationId
		},
		data: {
			pinnedMessageId: pin
		}
	});
}
