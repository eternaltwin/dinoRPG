import { FightResult } from '@drpg/core/models/fight/FightResult';
import { AxiosError } from 'axios';
import mitt from 'mitt';
import { DinozItems } from '@drpg/core/models/item/DinozItems';

type Events = {
	responseError: AxiosError;
	isLoading: boolean;
	fightResult: FightResult;
	resurrect: boolean;
	toast: toast;
	refreshDinoz: boolean;
	refreshMoney: boolean;
	refreshInventory: boolean;
	message: boolean;
	report: number | undefined;
	equipItem: Array<DinozItems>;
	twinoMenu: boolean;
	dinozMenu: boolean;
};

type toast = {
	message: string;
	type: 'error' | 'reward';
	params?: Record<string, unknown>;
};

const EventBus = mitt<Events>();

export default EventBus;
