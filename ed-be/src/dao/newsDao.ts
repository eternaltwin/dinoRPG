import { Player, Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export const createNews = async (allText: Prisma.NewsCreateInput) => {
	const data = await prisma.news.create({
		data: allText,
		select: { id: true }
	});
	return data.id;
};

export const getBatchOfNews = async (page: number, player: Pick<Player, 'lang' | 'id'> | undefined) => {
	const lang = player?.lang ?? 'fr';
	let buff;

	switch (lang) {
		case 'fr':
			buff = await prisma.news.findMany({
				take: 10,
				skip: 10 * page - 10,
				orderBy: {
					createdDate: 'desc'
				},
				select: {
					id: true,
					title: true,
					frenchText: true,
					frenchTitle: true,
					createdDate: true,
					poll: {
						select: {
							id: true,
							isActive: true,
							options: {
								select: {
									optionText: true,
									id: true
								}
							},
							votes: {
								select: {
									playerId: true,
									pollOptionId: true
								}
							}
						}
					}
				}
			});
			return buff.map(n => {
				if (n.poll && n.poll.isActive) {
					n.poll.votes = n.poll.votes.filter(v => v.playerId === player?.id);
				}
				return {
					id: n.id,
					createdDate: n.createdDate,
					title: n.frenchTitle,
					text: n.frenchText,
					poll: n.poll
				};
			});
		case 'en':
			buff = await prisma.news.findMany({
				take: 10,
				skip: 10 * page - 10,
				orderBy: {
					createdDate: 'desc'
				},
				select: {
					id: true,
					title: true,
					englishText: true,
					englishTitle: true,
					createdDate: true,
					poll: {
						select: {
							id: true,
							isActive: true,
							options: {
								select: {
									optionText: true,
									id: true
								}
							},
							votes: {
								select: {
									playerId: true,
									pollOptionId: true
								}
							}
						}
					}
				}
			});
			return buff.map(n => {
				if (n.poll && n.poll.isActive) {
					n.poll.votes = n.poll.votes.filter(v => v.playerId === player?.id);
				}
				return {
					id: n.id,
					createdDate: n.createdDate,
					title: n.englishTitle,
					text: n.englishText,
					poll: n.poll
				};
			});
		case 'es':
			buff = await prisma.news.findMany({
				take: 10,
				skip: 10 * page - 10,
				orderBy: {
					createdDate: 'desc'
				},
				select: {
					id: true,
					title: true,
					spanishText: true,
					spanishTitle: true,
					createdDate: true,
					poll: {
						select: {
							id: true,
							isActive: true,
							options: {
								select: {
									optionText: true,
									id: true
								}
							},
							votes: {
								select: {
									playerId: true,
									pollOptionId: true
								}
							}
						}
					}
				}
			});
			return buff.map(n => {
				if (n.poll && n.poll.isActive) {
					n.poll.votes = n.poll.votes.filter(v => v.playerId === player?.id);
				}
				return {
					id: n.id,
					createdDate: n.createdDate,
					title: n.spanishTitle,
					text: n.spanishText,
					poll: n.poll
				};
			});
		case 'de':
			buff = await prisma.news.findMany({
				take: 10,
				skip: 10 * page - 10,
				orderBy: {
					createdDate: 'desc'
				},
				select: {
					id: true,
					title: true,
					germanText: true,
					germanTitle: true,
					createdDate: true,
					poll: {
						select: {
							id: true,
							isActive: true,
							options: {
								select: {
									optionText: true,
									id: true
								}
							},
							votes: {
								select: {
									playerId: true,
									pollOptionId: true
								}
							}
						}
					}
				}
			});
			return buff.map(n => {
				if (n.poll && n.poll.isActive) {
					n.poll.votes = n.poll.votes.filter(v => v.playerId === player?.id);
				}
				return {
					id: n.id,
					createdDate: n.createdDate,
					title: n.germanTitle,
					text: n.germanText,
					poll: n.poll
				};
			});
		default:
			buff = await prisma.news.findMany({
				take: 10,
				skip: 10 * page - 10,
				orderBy: {
					createdDate: 'desc'
				},
				select: {
					id: true,
					title: true,
					frenchText: true,
					frenchTitle: true,
					createdDate: true,
					poll: {
						select: {
							id: true,
							isActive: true,
							options: {
								select: {
									optionText: true,
									id: true
								}
							},
							votes: {
								select: {
									playerId: true,
									pollOptionId: true
								}
							}
						}
					}
				}
			});
			return buff.map(n => {
				if (n.poll && n.poll.isActive) {
					n.poll.votes = n.poll.votes.filter(v => v.playerId === player?.id);
				}
				return {
					id: n.id,
					createdDate: n.createdDate,
					title: n.frenchTitle,
					text: n.frenchText,
					poll: n.poll
				};
			});
	}
};

export const updateAnyNews = async (title: string, newObject: Prisma.NewsUpdateInput) => {
	await prisma.news.updateMany({
		where: { title },
		data: newObject
	});
};

export const getNewsIllus = async (id: number) => {
	const news = await prisma.news.findUnique({
		where: { id },
		select: { image: true }
	});

	if (!news) throw new ExpectedError('News not found');

	return news;
};

export const getNewsDate = async (id: number) => {
	const news = await prisma.news.findUnique({
		where: { id },
		select: { createdDate: true }
	});

	if (!news) throw new ExpectedError('News not found');

	return news;
};
