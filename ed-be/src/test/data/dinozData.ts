import { Dinoz, DinozItem, DinozSkill, DinozStatus, DinozSkillUnlockable } from '../../entity/index.js';
import { itemList, placeList, raceList, skillList, statusList } from '../../constants/index.js';
import { player, dinozId, skillId, skillId2, dinozName } from '../utils/constants.js';
import { PlayerData, BasicPlayerWithRank } from './playerData.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { ElementType } from '@drpg/core/models/enums/ElementType';

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
	experience: 100,
	missions: []
} as unknown) as Dinoz;

export const DinozFicheDataWithMission = ({
	id: dinozId,
	player: PlayerData,
	race: {
		price: 20000
	},
	level: 1,
	items: [{ itemId: 1 }, { itemId: 2 }, { itemId: 3 }],
	status: [{ statusId: 1 }],
	placeId: 3,
	experience: 100,
	missions: [
		{
			missionId: 1,
			step: 2,
			progress: 0,
			isFinished: false
		}
	]
} as unknown) as Dinoz;

export const MonsterDataLvl1 = {
	name: 'goupignon',
	hp: 10,
	attack: 1,
	gold: 100,
	xp: 10,
	odds: 100,
	level: 1
};

export const MonsterDataLvl7 = {
	name: 'wolf',
	hp: 15,
	attack: 1,
	gold: 500,
	xp: 20,
	odds: 80,
	level: 5
};

export const fightLvl1Win = {
	winner: true,
	attackers: [{ dinoz_id: dinozId, hp_lost: 20, items_used: [] }],
	defenders: [{ dinoz_id: 0, hp_lost: 10, items_used: [] }]
};

export const fightLvl7Win = {
	winner: true,
	attackers: [{ dinoz_id: dinozId, hp_lost: 20, items_used: [] }],
	defenders: [{ dinoz_id: 0, hp_lost: 10, items_used: [] }]
};

export const fightResultlvl1Win = {
	opponent: 'goupignon',
	hpLost: 8,
	dinozId: dinozId,
	goldEarned: 100,
	xpEarned: 10,
	result: true
};

export const fightResultlvl7Win = {
	opponent: 'wolf',
	hpLost: 12,
	dinozId: dinozId,
	goldEarned: 500,
	xpEarned: 20,
	result: true
};

export const DinozFightDataWithMission = ({
	id: dinozId,
	placeId: 1,
	level: 1,
	life: 100,
	max_life: 100,
	experience: 0,
	nbrUpFire: 2,
	nbrUpWood: 1,
	nbrUpWater: 1,
	nbrUpLightning: 1,
	nbrUpAir: 1,
	items: [{ itemId: 1 }],
	skills: [{ skillId: 1 }],
	status: [{ statusId: 1 }, { statusId: 2 }, { statusId: 12 }],
	missions: [
		{
			missionId: 3,
			step: 0,
			progress: 1,
			isFinished: false
		}
	],
	player: PlayerData
} as unknown) as Dinoz;

export const DinozFightData = ({
	id: dinozId,
	placeId: 1,
	level: 1,
	life: 100,
	max_life: 100,
	experience: 0,
	nbrUpFire: 2,
	nbrUpWood: 1,
	nbrUpWater: 1,
	nbrUpLightning: 1,
	nbrUpAir: 1,
	items: [{ itemId: 1 }],
	skills: [{ skillId: 1 }],
	status: [{ statusId: 1 }, { statusId: 2 }, { statusId: 12 }],
	missions: [],
	player: PlayerData
} as unknown) as Dinoz;
export const DinozKillFightData = ({
	id: dinozId,
	placeId: placeList.UNIVERSITE.placeId,
	level: 1,
	life: 100,
	max_life: 100,
	experience: 0,
	nbrUpFire: 2,
	nbrUpWood: 1,
	nbrUpWater: 1,
	nbrUpLightning: 1,
	nbrUpAir: 1,
	items: [{ itemId: 1 }],
	skills: [{ skillId: 1 }],
	status: [{ statusId: 1 }, { statusId: 2 }, { statusId: 12 }],
	missions: [
		{
			missionId: 3,
			step: 0,
			progress: 1,
			isFinished: false
		}
	],
	player: PlayerData
} as unknown) as Dinoz;

export const DinozNPCData = ({
	id: dinozId,
	placeId: 3,
	level: 1,
	status: [{ statusId: 1 }, { statusId: 2 }, { statusId: 12 }],
	missions: [
		{
			missionId: 1,
			step: 2,
			progress: 0,
			isFinished: true
		}
	],
	player: PlayerData
} as unknown) as Dinoz;

export const DinozSecondMission = ({
	id: dinozId,
	placeId: placeList.COLLINES_ESCARPEES.placeId,
	level: 1,
	status: [{ statusId: 1 }, { statusId: 2 }, { statusId: 12 }],
	missions: [
		{
			missionId: 1,
			step: 2,
			progress: 0,
			isFinished: true
		},
		{
			missionId: 2,
			step: 0,
			progress: 0,
			isFinished: false
		}
	],
	player: PlayerData
} as unknown) as Dinoz;

export const DinozKillMission = ({
	id: dinozId,
	placeId: placeList.COLLINES_ESCARPEES.placeId,
	level: 1,
	status: [{ statusId: 1 }, { statusId: 2 }, { statusId: 12 }],
	missions: [
		{
			missionId: 1,
			step: 2,
			progress: 0,
			isFinished: true
		},
		{
			missionId: 2,
			step: 0,
			progress: 0,
			isFinished: true
		},
		{
			missionId: 3,
			step: 0,
			progress: 2,
			isFinished: false
		}
	],
	player: PlayerData
} as unknown) as Dinoz;

export const missionRewards = [
	{
		rewardType: 'xp',
		value: 10
	},
	{
		quantity: 1,
		rewardType: 'item',
		value: 'POTION_ANGEL'
	}
];

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

export const multipleDinoz = [
	{
		id: undefined,
		player: {
			id: 1,
			leader: true
		}
	},
	{
		id: undefined,
		player: {
			id: 1,
			leader: true
		}
	},
	{
		id: undefined,
		player: {
			id: 1,
			leader: true
		}
	}
];

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
