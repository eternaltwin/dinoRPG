import { AssDinozItem, AssDinozSkill, AssDinozSkillUnlockable, AssDinozStatus, Dinoz, ElementType } from '../../models';
import { itemList, placeList, raceList, skillList, statusList } from '../../constants';
import { player, dinozId, skillId, skillId2 } from '../utils/constants';
import { BasicPlayerWithRank } from './playerData';

export const DinozFicheData = ({
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
	placeId: 1,
	level: 1
} as Dinoz;

export const DinozToChangeName = {
	canChangeName: true,
	player: {
		playerId: player.id_1
	}
} as Dinoz;

export const DinozData = {
	id: dinozId,
	playerId: player.id_1,
	level: 1,
	placeId: placeList.FORGES_DU_GTC.placeId,
	status: [{ statusId: 1 }]
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

export const DinozLevel1LevelUp: Partial<Dinoz> = {
	raceId: raceList.WINKS.raceId,
	display: '00d654dfgdsfg',
	experience: 100,
	level: 1,
	nextUpElementId: ElementType.FIRE,
	nextUpAltElementId: ElementType.FIRE,
	nbrUpFire: 0,
	nbrUpWood: 0,
	nbrUpWater: 1,
	nbrUpLightning: 1,
	nbrUpAir: 0,
	player: BasicPlayerWithRank,
	skill: [],
	skillUnlockable: [],
	item: [],
	status: []
};

export const DinozLevel1LevelUpInWood: Partial<Dinoz> = {
	raceId: raceList.WINKS.raceId,
	display: '00d654dfgdsfg',
	experience: 100,
	level: 1,
	nextUpElementId: ElementType.WOOD,
	nextUpAltElementId: ElementType.WOOD,
	nbrUpFire: 0,
	nbrUpWood: 0,
	nbrUpWater: 1,
	nbrUpLightning: 1,
	nbrUpAir: 0,
	player: BasicPlayerWithRank,
	skill: [],
	skillUnlockable: [],
	item: [],
	status: []
};

export const DinozLevel2LevelUp: Partial<Dinoz> = {
	raceId: raceList.WINKS.raceId,
	display: '00d654dfgdsfg',
	experience: 107,
	level: 2,
	nextUpElementId: ElementType.WATER,
	nextUpAltElementId: ElementType.WATER,
	nbrUpFire: 1,
	nbrUpWood: 0,
	nbrUpWater: 1,
	nbrUpLightning: 1,
	nbrUpAir: 0,
	player: BasicPlayerWithRank,
	skill: [{ skillId: skillList.MUTATION.skillId } as AssDinozSkill],
	skillUnlockable: [
		{ skillId: skillList.POCHE_VENTRALE.skillId } as AssDinozSkillUnlockable,
		{ skillId: skillList.KARATE_SOUS_MARIN.skillId } as AssDinozSkillUnlockable
	],
	item: [{ itemId: itemList.DINOZ_CUBE.itemId } as AssDinozItem],
	status: []
};

export const DinozLevel50LevelUp: Partial<Dinoz> = {
	raceId: raceList.WINKS.raceId,
	display: '09d654dfgdsfg',
	experience: 3444,
	level: 50,
	nextUpElementId: ElementType.LIGHTNING,
	nextUpAltElementId: ElementType.AIR,
	nbrUpFire: 4,
	nbrUpWood: 2,
	nbrUpWater: 23,
	nbrUpLightning: 22,
	nbrUpAir: 6,
	player: BasicPlayerWithRank,
	skill: [{ skillId: skillList.PLAN_DE_CARRIERE.skillId } as AssDinozSkill],
	skillUnlockable: [],
	item: [{ itemId: itemList.DINOZ_CUBE.itemId } as AssDinozItem],
	status: [{ statusId: statusList.ETHER_DROP } as AssDinozStatus]
};

export const DinozLevel11LevelUp: Partial<Dinoz> = {
	raceId: raceList.WINKS.raceId,
	display: '00d654dfgdsfg',
	experience: 206,
	level: 11,
	nextUpElementId: ElementType.AIR,
	nextUpAltElementId: ElementType.AIR,
	nbrUpFire: 1,
	nbrUpWood: 2,
	nbrUpWater: 2,
	nbrUpLightning: 3,
	nbrUpAir: 0,
	player: BasicPlayerWithRank,
	skill: [],
	skillUnlockable: [],
	item: [{ itemId: itemList.DINOZ_CUBE.itemId } as AssDinozItem],
	status: []
};
