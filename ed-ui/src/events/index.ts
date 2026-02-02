import { FightResult } from '@drpg/core/models/fight/FightResult';
import { AxiosError } from 'axios';
import mitt from 'mitt';
import { DinozItems } from '@drpg/core/models/item/DinozItems';

type Events = {
	responseError: AxiosError;
	fightResult: FightResult;
	resurrect: boolean;
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
	clanBannerUpdated: string;
	confirmDialog: boolean;
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
