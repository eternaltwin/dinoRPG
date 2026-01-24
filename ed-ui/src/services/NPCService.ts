import { http } from '../utils/index.js';
import { NpcTalk } from '@drpg/core/models/npc/NpcTalk';

export const NPCService = {
	async talkTo(dinoz: number, npc: string, step: string, stop?: boolean): Promise<NpcTalk> {
		const res = await http().put(`/npc/${dinoz}/${npc}`, {
			step: step,
			stop: stop
		});
		return res.data;
	}
};
