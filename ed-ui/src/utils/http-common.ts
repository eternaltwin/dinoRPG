import axios, { AxiosInstance } from 'axios';
import urlJoin from 'url-join';
import { sessionStore } from '@/store';

const API_SERVER = new URL(process.env.VUE_APP_API_URL);
const API_BASE = urlJoin(API_SERVER.toString(), 'api/v1');

export const http = function (): AxiosInstance {
	const jwt: string | undefined = sessionStore().getJwt;

	const authHeaders = jwt === undefined ? {} : ({ Authorization: `Bearer ${jwt}` } as Record<string, string>);

	return axios.create({
		baseURL: API_BASE,
		headers: {
			'Content-type': 'application/json',
			...authHeaders
		}
	});
};
