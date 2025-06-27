import { ToastPluginApi } from 'vue-toast-notification';
import EventBus from '../events/index.js';
import axios from 'axios';
import { deleteCookie } from './cookies.js';

export const errorHandler = {
	handle(err: unknown, ToastFunction: ToastPluginApi): void {
		if (axios.isAxiosError(err) && err.response) {
			ToastFunction.open({
				message: err.response.data,
				type: 'error'
			});
			if (err.response.data === 'Invalid user ID') {
				const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
				deleteCookie(`x-drpg-${channel}-user`);
				deleteCookie(`x-drpg-${channel}-token`);
			}

			EventBus.emit('isLoading', false);
		}
	}
};
