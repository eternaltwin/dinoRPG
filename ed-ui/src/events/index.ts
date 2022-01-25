import { FightResult } from '@/models';
import { AxiosError } from 'axios';
import mitt from 'mitt';

type Events = {
	responseError: AxiosError;
	isLoading: boolean;
	fightResult: FightResult;
};

const EventBus = mitt<Events>();

export default EventBus;
