import { Dinoz } from '../../models';
import { placeList } from '../../constants';
import { player, dinozId, skillId, skillId2 } from '../utils/constants';

export const DinozFiche = ({
	id: dinozId,
	playerId: player.id_1,
	race: {
		price: 20000
	},
	level: 1,
	item: [{ itemId: 1 }, { itemId: 2 }, { itemId: 3 }],
	status: [{ statusId: 1 }],
	placeId: 1
} as unknown) as Dinoz;

export const DinozWithSkills = {
	id: dinozId,
	playerId: player.id_1,
	skill: [{ skillId: skillId }]
} as Dinoz;

export const DinozWithSkillsAndStatus = {
	playerId: player.id_1,
	skill: [{ skillId: skillId2 }],
	status: [{ statusId: 1 }, { statusId: 12 }]
} as Dinoz;

export const DinozWithSkillsAndStatusReadyToMove = {
	playerId: player.id_1,
	placeId: 1,
	skill: [{ skillId: skillId2 }],
	status: [{ statusId: 2 }, { statusId: 12 }]
} as Dinoz;

export const BasicDinoz = {
	dinozId: dinozId,
	display: '63cvi4d1fs',
	experience: 0,
	life: 100,
	name: '?',
	placeId: 1
} as Dinoz;

export const DinozToChangeName = {
	canChangeName: true,
	player: {
		playerId: player.id_1
	}
} as Dinoz;

export const DinozAtForges = {
	id: dinozId,
	playerId: player.id_1,
	level: 1,
	placeId: placeList.FORGES_DU_GTC.placeId
} as Dinoz;

export const AllDinozFromAnAccount = [
	{
		dinozId: 123456,
		player: {
			playerId: player.id_1
		}
	},
	{
		dinozId: 654321,
		player: {
			playerId: player.id_1
		}
	}
] as Array<Dinoz>;

export const AllDinozFromAnAccountArray = [123456, 654321] as Array<number>;
