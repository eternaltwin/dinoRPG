import http from '@/helpers/http-common';

export const DataService = {
	importAccount(code: string): Promise<any> {
		return http()
			.get(`/player/import/${code}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
