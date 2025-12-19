import { Notification } from '../notifications/notification.mjs';
import { LiveStatsType } from '../store/LiveStats.mjs';

export type SseData =
	| { type: SseDataEnum.NOTIFICATIONS; notifications: Notification }
	| { type: SseDataEnum.LIVE_STATS; live_stats: LiveStatsType };

export enum SseDataEnum {
	NOTIFICATIONS = 'notifications',
	LIVE_STATS = 'live_stats'
}
