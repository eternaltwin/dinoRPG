import { Notification } from '../notifications/notification.mjs';
import { LiveStatsType } from '../store/LiveStats.mjs';
import { PROSPECTOR_NOTIFICATION, WAR_NOTIFICATION } from '../clan/clanWar.mjs';

export type SseData =
	| { type: SseDataEnum.NOTIFICATIONS; notifications: Notification }
	| { type: SseDataEnum.LIVE_STATS; live_stats: LiveStatsType }
	| { type: SseDataEnum.CLAN_WAR; war: WAR_NOTIFICATION }
	| { type: SseDataEnum.CLAN_PROSPECTOR; prospector: PROSPECTOR_NOTIFICATION };

export enum SseDataEnum {
	NOTIFICATIONS = 'notifications',
	LIVE_STATS = 'live_stats',
	CLAN_WAR = 'clan_war',
	CLAN_PROSPECTOR = 'clan_prospector'
}
