import { ToastPluginApi } from 'vue-toast-notification';
import EventBus from '../events/index.js';
import axios from 'axios';
import { deleteCookie } from './cookies.js';

export const errorHandler = {
	handle(err: Error, ToastFunction: ToastPluginApi): void {
		if (axios.isAxiosError(err) && err.response) {
			ToastFunction.open({
				message: err.response.data,
				type: 'error'
			});
			if (err.response.data === 'Invalid user ID') {
				deleteCookie('x-drpg-user');
				deleteCookie('x-drpg-token');
			}

			EventBus.emit('isLoading', false);
		}
	}
};
