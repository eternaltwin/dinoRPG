import { NotificationSeverity } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { sendSseMessageToUserInChannel } from '../business/serverEventService.js';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { SseDataEnum } from '@drpg/core/models/serverEvents/SseData';

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
	severity: NotificationSeverity,
	link?: string
) {
	const notif = await prisma.notification.create({
		data: {
			player: { connect: { id: userId } },
			message: message,
			severity: severity,
			link: link
		}
	});

	sendSseMessageToUserInChannel(userId, SseChannel.NOTIFICATION, {
		type: SseDataEnum.NOTIFICATIONS,
		notifications: notif
	});
}

//clan: { connect: { id: member.clanId } },
// 				author: { connect: { id: member.playerId } },
// 				type: ClanHistoryType[ClanHistoryType.PLAYER_EXCLUSION]
