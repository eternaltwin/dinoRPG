import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export const createNews = async (allText: Prisma.NewsCreateInput) => {
	await prisma.news.create({
		data: allText,
		select: { id: true }
	});
};

export const getBatchOfNews = async (page: number, playerId: string) => {
	const news = await prisma.news.findMany({
		take: 10,
		skip: 10 * page - 10,
		orderBy: { createdDate: 'desc' },
		include: { likedBy: true }
	});

	return news.map(news => ({
		id: news.id,
		title: news.title,
		type: news.type,
		subtype: news.subtype,
		frenchText: news.frenchText,
		englishText: news.englishText,
		spanishText: news.spanishText,
		germanText: news.germanText,
		frenchTitle: news.frenchTitle,
		englishTitle: news.englishTitle,
		spanishTitle: news.spanishTitle,
		germanTitle: news.germanTitle,
		createdDate: news.createdDate,
		likes: news.likedBy.length,
		likedByMe: news.likedBy.some(like => like.playerId === playerId)
	}));
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

// Checks if the player has already liked the news
export const hasPlayerLikedNews = async (newsId: number, playerId: string) => {
	return prisma.newsLike.findUnique({
		where: { newsId_playerId: { newsId, playerId } }
	});
};

// Creates a like
export const likeNews = async (newsId: number, playerId: string) => {
	await prisma.newsLike.create({
		data: { newsId, playerId }
	});

	const likes = await prisma.newsLike.count({
		where: { newsId }
	});

	return { newsId, likes, likedByMe: true };
};

// Removes a like
export const unlikeNews = async (newsId: number, playerId: string) => {
	await prisma.newsLike.delete({
		where: { newsId_playerId: { newsId, playerId } }
	});

	const likes = await prisma.newsLike.count({
		where: { newsId }
	});

	return { newsId, likes, likedByMe: false };
};
