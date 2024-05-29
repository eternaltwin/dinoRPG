import EventBus from '../events/index.js';
import router from '../router/index.js';
import axios from 'axios';
import { localStore } from '../store/index.js';

export const errorHandler = {
	handle(err: unknown): void {
		if (axios.isAxiosError(err) && err.response) {
			// For toast display if it's a client error
			if (err.response.status === 400) {
				EventBus.emit('isLoading', false);
				EventBus.emit('toast', { type: 'error', message: err.response.data as string });
			} else if (err.response.status === 401) {
				localStore().$reset();
				router.go(0);
			} else if (err.response.status === 405) {
				localStore().$reset();
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
