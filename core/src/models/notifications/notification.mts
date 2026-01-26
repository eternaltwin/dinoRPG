import { NotificationSeverity } from '@drpg/prisma/enums';

export interface Notification {
	id: string;
	message: string;
	severity: NotificationSeverity;
	link: string | null;
	date: Date;
}

export type translatedNotification =
	| {
			id: string;
			message: string;
			severity: NotificationSeverity.offerExpired;
			link: {
				name: string;
				params: {
					tab: number;
				};
			};
			date: Date;
	  }
	| {
			id: string;
			message: string;
			severity: NotificationSeverity.offerEnded;
			link: {
				name: string;
				params: {
					tab: number;
				};
			};
			date: Date;
	  }
	| {
			id: string;
			message: string;
			severity: NotificationSeverity.offerWon;
			link: {
				name: string;
				params: {
					tab: number;
				};
			};
			date: Date;
	  }
	| {
			id: string;
			message: string;
			severity: NotificationSeverity.warning | NotificationSeverity.ban;
			link: null;
			date: Date;
	  }
	| {
			id: string;
			message: string;
			severity: Exclude<
				NotificationSeverity,
				| NotificationSeverity.offerWon
				| NotificationSeverity.offerEnded
				| NotificationSeverity.offerExpired
				| NotificationSeverity.warning
				| NotificationSeverity.ban
			>;
			link: string | null;
			date: Date;
	  };
