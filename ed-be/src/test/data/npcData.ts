import { placeList } from '../../constants/place.js';
import { Npc, NpcData, NpcTrigger } from '../../models/index.js';

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
