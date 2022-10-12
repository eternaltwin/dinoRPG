import { http } from '@/utils';
import { NpcTalk } from '@/models';

export const NPCService = {
	talkTo(dinoz: number, npc: string, step: string, stop?: boolean): Promise<NpcTalk> {
		return http()
			.put(`/npc/${dinoz}/${npc}`, {
				step: step,
				stop: stop
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
