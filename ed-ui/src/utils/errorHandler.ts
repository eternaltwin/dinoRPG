import { ToastPluginApi } from 'vue-toast-notification';
import axios from 'axios';
import { deleteCookie } from './cookies.js';
import { useLoadingStore } from '../store';
import { WsRequestError } from './WsRequestError.js';
import { translate } from '../i18n/index.js';

export const errorHandler = {
	handle(err: unknown, ToastFunction: ToastPluginApi): void {
		if (err instanceof WsRequestError) {
			ToastFunction.open({
				message: err.serverMessage ?? translate('clanChampionship.connectionLost'),
				type: 'error'
			});
			return;
		}
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

			useLoadingStore().setLoaderOff();
		}
	}
};
