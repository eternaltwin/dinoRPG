import { FightResult } from '@/models';
import { AxiosError } from 'axios';
import mitt from 'mitt';

type Events = {
	responseError: AxiosError;
	isLoading: boolean;
	fightResult: FightResult;
	resurrect: boolean;
};

const EventBus = mitt<Events>();

export default EventBus;
