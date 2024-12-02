import { $Enums } from '@drpg/prisma';
import NotificationSeverity = $Enums.NotificationSeverity;

export interface Notification {
	id: string;
	message: string;
	severity: NotificationSeverity;
	link: string | null;
	date: Date;
}
