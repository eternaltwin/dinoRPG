import EventBus from '../events';
import router from '../router';
import axios from 'axios';

export const errorHandler = {
	handle(err: unknown): void {
		if (axios.isAxiosError(err) && err.response) {
			// For toast display if it's a client error
			if (err.response.status === 400) {
				EventBus.emit('isLoading', false);
				EventBus.emit('toast', { type: 'error', message: err.response.data as string });
			} else if (err.response.status === 401) {
				sessionStorage.clear();
				router.go(0);
			} else {
				// For pop up display if it's a servor error
				EventBus.emit('isLoading', false);
				EventBus.emit('responseError', err);
				router.push({ name: 'MainPage' });
			}
		}
	}
};
