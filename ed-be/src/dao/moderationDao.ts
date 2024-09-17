import { ModerationReason } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export async function createModeration(
	author: number,
	target: number,
	reason: ModerationReason,
	comment: string,
	dinozId?: number
) {
	const mod = await prisma.moderation.create({
		data: {
			reporter: { connect: { id: author } },
			target: { connect: { id: target } },
			reason: reason,
			comment: comment,
			...(dinozId && { dinoz: { connect: { id: dinozId } } })
		}
	});

	return mod;
}

export async function getModeration(page: number) {
	const skip = (page - 1) * 20;
	const take = 20;
	const mod = await prisma.moderation.findMany({
		skip: skip,
		take: take,
		orderBy: {
			id: 'desc'
		},
		select: {
			id: true,
			comment: true,
			reason: true,
			sorted: true,
			reporter: {
				select: {
					id: true,
					name: true
				}
			},
			target: {
				select: {
					id: true,
					name: true,
					customText: true
				}
			},
			dinoz: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});

	return mod;
}
