import axios from 'axios';
import { isNil } from 'lodash';
import store from '@/store';

export const http = function() {
	const jwt: string = store.getters.getJwt;

	if (!isNil(jwt)) {
		return axios.create({
			baseURL: 'http://localhost:8081/api',
			headers: {
				'Content-type': 'application/json',
				Authorization: 'Bearer ' + jwt
			}
		});
	} else {
		return axios.create({
			baseURL: 'http://localhost:8081/api',
			headers: {
				'Content-type': 'application/json'
			}
		});
	}
};
