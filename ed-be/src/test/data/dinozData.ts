import { AssDinozSkill, AssDinozStatus, Dinoz } from '../../models';
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
	experience: 99,
	level: 1,
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

export const DinozListFromAnAccount = ([
	{
		dinozId: 123456,
		following: null,
		name: 'Biosha',
		isFrozen: false,
		isSacrificed: false,
		level: 5,
		missionId: null,
		placeId: 4,
		canChangeName: false,
		life: 45,
		maxLife: 130,
		experience: 34,
		status: [
			{
				statusId: 5
			},
			{
				statusId: 4
			}
		],
		skill: [
			{
				skillId: 61103,
				state: null
			},
			{
				skillId: 61103,
				state: null
			},
			{
				skillId: 61104,
				state: null
			}
		],
		player: {
			playerId: player.id_1
		}
	},
	{
		dinozId: 7894,
		following: null,
		name: 'Biocat',
		isFrozen: true,
		isSacrificed: false,
		level: 50,
		missionId: null,
		placeId: 35,
		canChangeName: false,
		life: 220,
		maxLife: 300,
		experience: 451,
		status: [
			{
				statusId: 5
			},
			{
				statusId: 4
			}
		],
		skill: [
			{
				skillId: 61103,
				state: null
			},
			{
				skillId: 61103,
				state: null
			},
			{
				skillId: 61104,
				state: null
			}
		],
		player: {
			playerId: player.id_1
		}
	}
] as unknown) as Array<Dinoz>;

export const AllDinozFromAnAccountArray = [123456, 654321] as Array<number>;
