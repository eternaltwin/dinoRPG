import { Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { ErrorFormator } from '../utils/errorFormator.js';

export const createNews = async (allText: Prisma.NewsCreateInput) => {
	await prisma.news.create({
		data: allText,
		select: { id: true }
	});
};

export const getBatchOfNews = async (page: number) => {
	const news = await prisma.news.findMany({
		take: 10,
		skip: 10 * page - 10,
		orderBy: {
			createdDate: 'desc'
		},
		select: {
			id: true,
			title: true,
			frenchText: true,
			englishText: true,
			spanishText: true,
			germanText: true,
			frenchTitle: true,
			englishTitle: true,
			spanishTitle: true,
			germanTitle: true,
			createdDate: true
		}
	});

	return news;
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

	if (!news) throw new ErrorFormator(500, 'News not found');

	return news;
};

export const getNewsDate = async (id: number) => {
	const news = await prisma.news.findUnique({
		where: { id },
		select: { createdDate: true }
	});

	if (!news) throw new ErrorFormator(500, 'News not found');

	return news;
};
