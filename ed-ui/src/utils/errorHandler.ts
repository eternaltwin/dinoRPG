import EventBus from '@/events';
import router from '@/router';
import axios from 'axios';

export const errorHandler = {
	handle(err: unknown): void {
		if (axios.isAxiosError(err) && err.response) {
			EventBus.emit('responseError', err);
			router.push({ name: 'Accueil' });
		}
	}
};
