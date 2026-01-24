import { http } from '../utils/index.js';

export const NotificationService = {
	async readNotification(id: string): Promise<boolean> {
		const res = await http().patch(`/notifications/${id}/read`);
		return res.data;
	},
	async readAllNotification(): Promise<boolean> {
		const res = await http().patch(`/notifications/all/read`);
		return res.data;
	}
};
