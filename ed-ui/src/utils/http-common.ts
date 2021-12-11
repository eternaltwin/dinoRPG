import axios, { AxiosInstance } from 'axios';
import { isNil } from 'lodash';
import urlJoin from 'url-join';
import store from '@/store';

const API_SERVER = new URL(process.env.VUE_APP_API_URL);
const API_BASE = urlJoin(API_SERVER.toString(), 'api');

export const http = function(): AxiosInstance {
	const jwt: string = store.getters.getJwt;

	const authHeaders = isNil(jwt) ? {} : { Authorization: `Bearer ${jwt}` };

	return axios.create({
		baseURL: API_BASE,
		headers: {
			'Content-type': 'application/json',
			...authHeaders
		}
	});
};
