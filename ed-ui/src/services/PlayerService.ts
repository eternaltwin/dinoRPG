import { http } from '@/utils';
import { Dinoz } from '@/models';

export const PlayerService = {
	getCommonData(): Promise<CommonData> {
		return http()
			.get('/player/commondata')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};

interface CommonData {
	money: number;
	dinoz: Dinoz;
	dinozCount: number;
}
