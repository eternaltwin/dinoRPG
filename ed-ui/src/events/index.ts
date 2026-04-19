import { AxiosError } from 'axios';
import mitt from 'mitt';

type Events = {
	responseError: AxiosError;
	toast: toast;
	refreshDinoz: boolean;
	refreshInventory: boolean;
	message: boolean;
	report: string | undefined;
	messageToPlayer: { name: string; id: string };
	connected: boolean;
};

type toast = {
	message: string;
	type: 'error' | 'reward' | 'success' | 'notif';
	params?: Record<string, unknown>;
	value?: string;
	effect?: string;
};

const EventBus = mitt<Events>();

export default EventBus;
