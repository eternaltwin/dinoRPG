import http from '@/helpers/http-common';

export const DataService = {
	//eslint-disable-next-line
	importAccount(code: string): Promise<any> {
		return http()
			.get(`/player/import/${code}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
