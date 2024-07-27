import { ToastPluginApi } from 'vue-toast-notification';
import EventBus from '../events/index.js';
import axios from 'axios';

export const errorHandler = {
	handle(err: Error, ToastFunction: ToastPluginApi): void {
		if (axios.isAxiosError(err) && err.response) {
			ToastFunction.open({
				message: err.response.data,
				type: 'error'
			});

			EventBus.emit('isLoading', false);
		}
	}
};
