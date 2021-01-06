import axios from 'axios';
import _ from 'lodash';

export default function() {
	const jwt = localStorage.jwt;

	if (!_.isNil(jwt)) {
		return axios.create({
			baseURL: 'http://localhost:8081/api',
			headers: {
				'Content-type': 'application/json',
				'Authorization': 'Bearer ' + jwt
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
}
