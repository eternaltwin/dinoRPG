import { FightResult } from '../models';
import { AxiosError } from 'axios';
import mitt from 'mitt';

type Events = {
	responseError: AxiosError;
	isLoading: boolean;
	fightResult: FightResult;
	resurrect: boolean;
	toast: toast;
	refreshDinoz: boolean;
};

type toast = {
	message: string;
	type: 'error' | 'reward';
};

const EventBus = mitt<Events>();

export default EventBus;
