import { Prisma } from "@drpg/prisma";
import { prisma } from "../prisma.js";

export const createNews = async (allText: Prisma.NewsCreateInput) => {
	await prisma.news.create({
		data: allText
	});
};

export const getBatchOfNews = async (page: number) => {
	const news = await prisma.news.findMany({
		take: 10,
		skip: 10 * page - 10,
		orderBy: {
			createdDate: 'desc'
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
