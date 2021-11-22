import axios, { AxiosInstance } from 'axios';
import { isNil } from 'lodash';
import store from '@/store';

export const http = function(): AxiosInstance {
	const jwt: string = store.getters.getJwt;

	if (!isNil(jwt)) {
		return axios.create({
			baseURL: `${process.env.VUE_APP_API_URL}/api`,
			headers: {
				'Content-type': 'application/json',
				Authorization: `Bearer ${jwt}`
			}
		});
	} else {
		return axios.create({
			baseURL: `${process.env.VUE_APP_API_URL}/api`,
			headers: {
				'Content-type': 'application/json'
			}
		});
	}
};
