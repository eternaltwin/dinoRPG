import axios, { AxiosInstance } from 'axios';
import urlJoin from 'url-join';
import { localStore } from '../store/index.js';

const protocol = import.meta.env.VITE_USE_HTTPS === 'true' ? 'https://' : 'http://';
const API_SERVER = new URL(`${protocol}${import.meta.env.VITE_API_URL}`);
export const API_BASE = urlJoin(API_SERVER.toString(), 'api/v1');

export const http = function (): AxiosInstance {
	const jwt: string | undefined = localStore().getJwt;

	const authHeaders = jwt === undefined ? {} : ({ Authorization: `Bearer ${jwt}` } as Record<string, string>);

	return axios.create({
		baseURL: API_BASE,
		headers: {
			'Content-type': 'application/json',
			...authHeaders
		}
	});
};
