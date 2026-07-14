import { http } from '../utils/index.js';
import { NpcTalk } from '@drpg/core/models/npc/NpcTalk';

export const NPCService = {
	async talkTo(dinoz: number, npc: string, step?: string): Promise<NpcTalk> {
		const res = await http().put(`/npc/${dinoz}/${npc}`, {
			step: step
		});
		return res.data;
	}
};
