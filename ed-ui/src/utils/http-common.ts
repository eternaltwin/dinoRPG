import axios, { AxiosInstance } from 'axios';
import urlJoin from 'url-join';
import { getCookie } from './cookies.js';

const API_SERVER = new URL(import.meta.env.VITE_API_URL);
export const API_BASE = urlJoin(API_SERVER.toString(), 'api/v1');

export const http = function (): AxiosInstance {
	const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
	const user = getCookie(`x-drpg-${channel}-user`) || '';
	const token = getCookie(`x-drpg-${channel}-token`) || '';

	return axios.create({
		baseURL: API_BASE,
		headers: {
			'Content-type': 'application/json',
			Authorization: user ? `Basic ${btoa(`${user}:${token}`)}` : ''
		}
	});
};
