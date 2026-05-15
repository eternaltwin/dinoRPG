import { App } from 'vue';
import ToastPlugin from 'vue-toast-notification';
import type { ToastPluginApi, ToastProps } from 'vue-toast-notification';
import { formatText } from './formatText';

interface ToastInstance {
	dismiss: () => void;
}

const MAX_TOASTS = 3;
const activeToasts: ToastInstance[] = [];

export const createToastPlugin = (options: ToastProps) => {
	return {
		install(app: App) {
			// Install the original toast plugin
			app.use(ToastPlugin, options);

			// Get the original toast instance
			const originalToast = app.config.globalProperties.$toast;

			// Create a wrapper that tracks toasts
			const wrappedToast: ToastPluginApi = {
				open: params => {
					// If we have 3 toasts, dismiss the oldest one
					if (activeToasts.length >= MAX_TOASTS) {
						const oldestToast = activeToasts.shift();
						oldestToast?.dismiss();
					}

					const formattedParams = {
						...params,
						message: typeof params.message === 'string' ? formatText(params.message) : params.message
					};

					// Open the new toast
					const toastInstance = originalToast.open(formattedParams);
					activeToasts.push(toastInstance);

					// Remove from tracking when dismissed
					const originalDismiss = toastInstance.dismiss;
					toastInstance.dismiss = () => {
						const index = activeToasts.indexOf(toastInstance);
						if (index > -1) {
							activeToasts.splice(index, 1);
						}
						originalDismiss.call(toastInstance);
					};

					return toastInstance;
				},
				success: (message, options) => {
					return wrappedToast.open({ message, type: 'success', ...options });
				},
				error: (message, options) => {
					return wrappedToast.open({ message, type: 'error', ...options });
				},
				info: (message, options) => {
					return wrappedToast.open({ message, type: 'info', ...options });
				},
				warning: message => {
					return wrappedToast.open({ message, type: 'warning', position: 'bottom-right', duration: 10000 });
				},
				default: (message, options) => {
					return wrappedToast.open({ message, type: 'default', ...options });
				},
				clear: () => {
					activeToasts.length = 0;
					originalToast.clear();
				}
			};

			// Replace the original $toast with our wrapper using defineProperty
			Object.defineProperty(app.config.globalProperties, '$toast', {
				get: () => wrappedToast,
				configurable: true
			});
		}
	};
};
