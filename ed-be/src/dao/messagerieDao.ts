import { prisma } from '../prisma.js';

export async function getConversationsWithPlayer(playerId: number) {
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
			messages: {
				select: {
					createdAt: true
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
	creatorId: number,
	participants: number[],
	title: string,
	firstMessageContent: string
) {
	return await prisma.conversation.create({
		data: {
			title: title, // Nom de la conversation ou valeur par défaut
			createdBy: {
				connect: { id: creatorId } // Lier le créateur
			},
			participants: {
				create: [
					{ player: { connect: { id: creatorId } } }, // Ajouter le créateur comme participant
					...participants.map(id => ({
						player: { connect: { id } } // Ajouter les autres participants
					}))
				]
			},
			messages: {
				create: {
					content: firstMessageContent, // Contenu du premier message
					sender: { connect: { id: creatorId } } // Lier le créateur comme auteur du premier message
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
}

export async function addToConversation(conversationId: string, participants: number[]) {
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
}

export async function removeFromConversation(conversationId: string, participants: number[]) {
	await prisma.participants.deleteMany({
		where: {
			conversationId: conversationId,
			playerId: {
				in: participants // Retire les joueurs dont les IDs sont dans le tableau
			}
		}
	});
}

export async function getConversation(conversationId: string, page: number) {
	const skip = (page - 1) * 10;
	const take = 10;
	return await prisma.conversation.findUniqueOrThrow({
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
					}
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

export async function getMoreMessages(conversationId: string, page: number) {
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

export async function addMessage(conversationId: string, message: string, senderId: number) {
	return await prisma.conversation.update({
		data: {
			messages: {
				create: {
					content: message,
					sender: {
						connect: {
							id: senderId
						}
					}
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
