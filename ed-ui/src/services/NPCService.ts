import { http } from '../utils/index.js';
import { NpcTalk } from '@drpg/core/src/models/npc/NpcTalk.mjs';

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
