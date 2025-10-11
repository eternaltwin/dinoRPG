import { Request } from 'express';
import { auth } from '../dao/playerDao.js';
import { readAllNotification, readNotification } from '../dao/notificationDao.js';

export async function setNotificationRead(req: Request) {
	const authed = await auth(req);
	await readNotification(req.params.notificationId, authed.id);
	return true;
}

export async function setAllNotificationRead(req: Request) {
	const authed = await auth(req);
	await readAllNotification(authed.id);
	return true;
}
