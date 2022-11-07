import { ElementType, DinozFiche } from '../../models/index.js';
import { Dinoz, DinozItem, DinozSkill, DinozStatus, DinozSkillUnlockable, PlayerItem } from '../../entity/index.js';
import { itemList, placeList, raceList, skillList, statusList } from '../../constants/index.js';
import { player, dinozId, skillId, skillId2, dinozName, itemId } from '../utils/constants.js';
import { PlayerData, BasicPlayerWithRank } from './playerData.js';

export const DinozFicheData = ({
	id: dinozId,
	player: PlayerData,
	race: {
		price: 20000
	},
	level: 1,
	items: [{ itemId: 1 }, { itemId: 2 }, { itemId: 3 }],
	status: [{ statusId: 1 }],
	placeId: 1,
	experience: 100
} as unknown) as Dinoz;

export const DinozWithSkills = {
	id: dinozId,
	player: {
		id: player.id_1
	},
	skills: [{ skillId: skillId }]
} as Dinoz;

export const DinozWithSkillsAndStatus = {
	id: dinozId,
	player: {
		id: player.id_1
	},
	skills: [{ skillId: skillId2 }],
	status: [{ statusId: 1 }, { statusId: 12 }]
} as Dinoz;

export const DinozWithSkillsAndStatusReadyToMove = {
	id: dinozId,
	player: {
		id: player.id_1
	},
	placeId: 1,
	experience: 99,
	level: 1,
	skills: [{ skillId: skillId2 }],
	status: [{ statusId: 2 }, { statusId: 12 }]
} as Dinoz;

export const DinozDead = {
	id: dinozId,
	player: {
		id: 12345
	},
	experience: 99,
	life: 0,
	name: dinozName
} as Dinoz;

export const DinozLite = {
	id: dinozId,
	player: {
		id: player.id_1,
		items: [
			{ itemId: 3, quantity: 23 }, //Nuage-burger
			{ itemId: 2, quantity: 23 } //Potion d'ange
		]
	},
	experience: 99,
	life: 95,
	placeId: placeList.FORCEBRUT.placeId,
	maxLife: 100,
	level: 1,
	name: dinozName,
	status: [{ statusId: 2 }, { statusId: 12 }],
	items: [{ itemId: 1 }, { itemId: 2 }, { itemId: 3 }]
} as Dinoz;

export const BasicDinoz = {
	id: dinozId,
	display: '63cvi4d1fs',
	experience: 0,
	life: 100,
	name: '?',
	placeId: 1,
	level: 1
} as Dinoz;

export const DinozToChangeName = {
	id: dinozId,
	canChangeName: true,
	player: {
		id: player.id_1
	}
} as Dinoz;

export const DinozData = {
	id: dinozId,
	player: {
		id: player.id_1
	},
	level: 1,
	placeId: placeList.FORGES_DU_GTC.placeId,
	status: [{ statusId: 1 }]
} as Dinoz;

export const AllDinozFromAnAccount = [
	{
		id: 123456,
		player: {
			id: player.id_1
		}
	},
	{
		id: 654321,
		player: {
			id: player.id_1
		}
	}
] as Array<Dinoz>;

export const DinozListFromAnAccount = ([
	{
		id: 123456,
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
		skills: [
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
		id: 7894,
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
		skills: [
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

export const DinozFicheListFromAnAccount = ([
	{
		id: 123456,
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
		status: [5, 4],
		skills: [61103, 61103, 61104]
	},
	{
		id: 7894,
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
		status: [5, 4],
		skills: [61103, 61103, 61104]
	}
] as unknown) as Array<DinozFiche>;

export const AllDinozFromAnAccountArray = [123456, 654321] as Array<number>;

export const DinozLevel1LevelUp: Partial<Dinoz> = {
	id: dinozId,
	raceId: raceList.WINKS.raceId,
	display: '00d654dfgdsfg',
	experience: 100,
	level: 1,
	placeId: 5,
	nextUpElementId: ElementType.FIRE,
	nextUpAltElementId: ElementType.FIRE,
	nbrUpFire: 0,
	nbrUpWood: 0,
	nbrUpWater: 1,
	nbrUpLightning: 1,
	nbrUpAir: 0,
	player: BasicPlayerWithRank,
	skills: [],
	skillsUnlockable: [],
	items: [],
	status: [],
	NPC: []
};

export const DinozLevel1LevelUpInWood: Partial<Dinoz> = {
	id: dinozId,
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
	skills: [],
	skillsUnlockable: [],
	items: [],
	status: []
};

export const DinozLevel2LevelUp: Partial<Dinoz> = {
	id: dinozId,
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
	skills: [{ skillId: skillList.MUTATION.skillId } as DinozSkill],
	skillsUnlockable: [
		{ skillId: skillList.POCHE_VENTRALE.skillId } as DinozSkillUnlockable,
		{ skillId: skillList.KARATE_SOUS_MARIN.skillId } as DinozSkillUnlockable
	],
	items: [{ itemId: itemList.DINOZ_CUBE.itemId } as DinozItem],
	status: []
};

export const DinozLevel50LevelUp: Partial<Dinoz> = {
	id: dinozId,
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
	skills: [{ skillId: skillList.PLAN_DE_CARRIERE.skillId } as DinozSkill],
	skillsUnlockable: [],
	items: [{ itemId: itemList.DINOZ_CUBE.itemId } as DinozItem],
	status: [{ statusId: statusList.ETHER_DROP } as DinozStatus]
};

export const DinozLevel11LevelUp: Partial<Dinoz> = {
	id: dinozId,
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
	skills: [],
	skillsUnlockable: [],
	items: [{ itemId: itemList.DINOZ_CUBE.itemId } as DinozItem],
	status: []
};
