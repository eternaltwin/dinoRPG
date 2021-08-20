import axios, { AxiosInstance } from 'axios';
import { isNil } from 'lodash';
import store from '@/store';
import config from '@/config';

export const http = function(): AxiosInstance {
	const jwt: string = store.getters.getJwt;

	if (!isNil(jwt)) {
		return axios.create({
			baseURL: `${config.general.serverURI}api`,
			headers: {
				'Content-type': 'application/json',
				Authorization: `Bearer ${jwt}`
			}
		});
	} else {
		return axios.create({
			baseURL: `${config.general.serverURI}api`,
			headers: {
				'Content-type': 'application/json'
			}
		});
	}
};
