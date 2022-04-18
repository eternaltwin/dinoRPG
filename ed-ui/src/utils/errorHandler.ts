import EventBus from '@/events';
import router from '@/router';
import axios from 'axios';

export const errorHandler = {
	handle(err: unknown): void {
		if (axios.isAxiosError(err) && err.response) {
			if (err.response.status === 401) {
				sessionStorage.clear();
				router.go(0);
			} else {
				EventBus.emit('isLoading', false);
				EventBus.emit('responseError', err);
				router.push({ name: 'MainPage' });
			}
		}
	}
};
