import { AxiosError } from 'axios';
import mitt from 'mitt';
import { DinozItems } from '@drpg/core/models/item/DinozItems';

type Events = {
	responseError: AxiosError;
	toast: toast;
	refreshDinoz: boolean;
	refreshDinozStats: boolean;
	refreshInventory: boolean;
	message: boolean;
	report: string | undefined;
	equipItem: Array<DinozItems>;
	unEquipItem: number;
	twinoMenu: boolean;
	dinozMenu: boolean;
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
