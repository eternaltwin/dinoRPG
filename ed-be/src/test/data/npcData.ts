import { placeList } from '../../constants/place.js';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { Npc } from '@drpg/core/models/npc/npc';
import { NpcTrigger } from '@drpg/core/models/enums/NpcTrigger';

export const NPC_Alpha = {
	begin: {
		stepName: 'begin',
		nextStep: ['talk'],
		initialStep: true
	},
	talk: {
		stepName: 'talk',
		alias: 'back',
		nextStep: ['element', 'world', 'experience']
	}
} as Readonly<Record<string, NpcData>>;

export const npcList: Record<string, Npc> = {
	ALPHA: {
		name: 'alpha_test',
		id: 0,
		placeId: placeList.DINOVILLE.placeId,
		condition: NpcTrigger.ALWAYS,
		data: NPC_Alpha
	}
};
