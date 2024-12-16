import { ModerationReason, Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export async function createModerationReport(
	author: number,
	target: number,
	reason: ModerationReason,
	comment: string,
	dinozId?: number
) {
	const reportData = await prisma.moderation.create({
		data: {
			reporter: { connect: { id: author } },
			target: { connect: { id: target } },
			reason: reason,
			comment: comment,
			...(dinozId && { dinoz: { connect: { id: dinozId } } })
		}
	});

	return reportData;
}

export async function getModerationReports(page: number) {
	const skip = (page - 1) * 20;
	const take = 20;
	const reports = await prisma.moderation.findMany({
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
			banDate: true,
			banEndDate: true,
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

	return reports;
}

export async function getModerationReport(id: number) {
	const reportData = await prisma.moderation.findUnique({
		where: {
			id: id
		},
		select: {
			id: true,
			sorted: true,
			reason: true,
			target: {
				select: {
					id: true,
					name: true,
					banCase: true
				}
			}
		}
	});

	return reportData;
}

export async function setModerationReport(reportId: number, report: Prisma.ModerationUpdateInput) {
	const reportData = await prisma.moderation.update({
		where: {
			id: reportId
		},
		data: report
	});

	return reportData;
}
