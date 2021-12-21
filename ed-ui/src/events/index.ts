import { AxiosError } from 'axios';
import mitt from 'mitt';

type Events = {
	responseError: AxiosError;
};

const EventBus = mitt<Events>();

export default EventBus;
