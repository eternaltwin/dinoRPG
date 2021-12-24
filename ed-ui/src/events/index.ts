import { AxiosError } from 'axios';
import mitt from 'mitt';

type Events = {
	responseError: AxiosError;
	isLoading: boolean;
};

const EventBus = mitt<Events>();

export default EventBus;
