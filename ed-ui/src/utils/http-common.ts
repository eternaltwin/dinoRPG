import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import urlJoin from 'url-join';
import { getCookie } from './cookies.js';
import { useLoadingStore } from '../store';

declare module 'axios' {
	export interface AxiosRequestConfig {
		silent?: boolean;
	}
}

const API_SERVER = new URL(import.meta.env.VITE_API_URL as string);
export const API_BASE = urlJoin(API_SERVER.toString(), 'api/v1');

const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE,
	timeout: 15000
});

// Intercepteur de Requête
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
		if (!config.silent) {
			const store = useLoadingStore();
			store.setLoaderOn();
		}

		const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
		const user = getCookie(`x-drpg-${channel}-user`) || '';
		const token = getCookie(`x-drpg-${channel}-token`) || '';

		if (user && token) {
			config.headers.Authorization = `Basic ${btoa(`${user}:${token}`)}`;
		}

		if (!(config.data instanceof FormData)) {
			config.headers['Content-Type'] = 'application/json';
		}

		return config;
	},
	(error: AxiosError): Promise<AxiosError> => {
		const store = useLoadingStore();
		store.setLoaderOff();
		return Promise.reject(error);
	}
);

// Intercepteur de Réponse
apiClient.interceptors.response.use(
	(response: AxiosResponse): AxiosResponse => {
		const store = useLoadingStore();
		store.setLoaderOff();
		return response;
	},
	(error: AxiosError): Promise<AxiosError> => {
		const store = useLoadingStore();
		store.setLoaderOff();
		return Promise.reject(error);
	}
);

export const http = (): AxiosInstance => apiClient;
