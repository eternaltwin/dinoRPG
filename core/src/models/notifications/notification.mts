import { $Enums } from '@drpg/prisma';
import NotificationSeverity = $Enums.NotificationSeverity;

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
			severity: 'offerExpired';
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
			severity: 'offerEnded';
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
			severity: 'offerWon';
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
			severity: 'warning' | 'ban';
			link: null;
			date: Date;
	  }
	| {
			id: string;
			message: string;
			severity: Exclude<NotificationSeverity, 'offerWon' | 'offerEnded' | 'offerExpired' | 'warning' | 'ban'>;
			link: string | null;
			date: Date;
	  };
