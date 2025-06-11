import { NotificationSeverity, Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';

export async function getNotification(playerId: string) {
	const notification = await prisma.player.findUnique({
		where: {
			id: playerId
		},
		select: {
			lastVersionSeen: true,
			notifications: {
				where: {
					read: false
				},
				orderBy: { date: 'desc' }
			}
		}
	});

	return notification;
}

export async function readNotificationFromMessages(playerId: string, thread: string) {
	await prisma.notification.updateMany({
		where: {
			playerId,
			message: thread,
			read: false
		},
		data: {
			read: true
		}
	});
}

export async function readNotification(id: string, userId: string) {
	await prisma.notification.update({
		where: { id: id, playerId: userId },
		data: { read: true }
	});
}

export async function readAllNotification(userId: string) {
	await prisma.notification.updateMany({
		where: { playerId: userId, read: false },
		data: { read: true }
	});
}

export async function createNotification(
	userId: string,
	message: string,
	severity?: NotificationSeverity,
	link?: string
) {
	await prisma.notification.create({
		data: {
			player: { connect: { id: userId } },
			message: message,
			severity: severity,
			link: link
		}
	});
}

//clan: { connect: { id: member.clanId } },
// 				author: { connect: { id: member.playerId } },
// 				type: ClanHistoryType[ClanHistoryType.PLAYER_EXCLUSION]
