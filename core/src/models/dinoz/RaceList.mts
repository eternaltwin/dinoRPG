// If price is 0 that means the dinoz cannot be purchased via the dinoz shop.
// For a demon dinoz, the price is the number of demon tickets.

import { DinozRace } from './DinozRace.mjs';
import { Skill } from './SkillList.mjs';
import { RaceEnum } from '../enums/RaceEnum.mjs';
import { ConditionEnum } from '../enums/Parser.mjs';
import { Reward } from '../reward/RewardList.mjs';
import { ElementType } from '../enums/ElementType.mjs';

export const raceList: Record<RaceEnum, DinozRace> = {
	[RaceEnum.MOUEFFE]: {
		raceId: RaceEnum.MOUEFFE,
		name: 'moueffe',
		demon: {
			condition: {
				[ConditionEnum.PLAYER_EPIC]: Reward.BELIUS
			},
			price: 600,
			skills: [Skill.FORCE_DE_LUMIERE],
			// 4 fire, 2 wood, 1 water, 1 lightning, 1 air
			guaranteed_elements: {
				[2]: ElementType.FIRE,
				[3]: ElementType.FIRE,
				[4]: ElementType.FIRE,
				[5]: ElementType.FIRE,
				[6]: ElementType.WOOD,
				[7]: ElementType.WOOD,
				[8]: ElementType.WATER,
				[9]: ElementType.LIGHTNING,
				[10]: ElementType.AIR
			}
		},
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 10,
			wood: 4,
			water: 2,
			lightning: 1,
			air: 3
		},
		price: 16000,
		swfLetter: '0'
	},
	[RaceEnum.PIGMOU]: {
		raceId: RaceEnum.PIGMOU,
		name: 'pigmou',
		demon: {
			price: 800,
			skills: [Skill.CHARGE_PIGMOU],
			// 5 fire, 1 wood, 2 water, 1 lightning, 0 air
			guaranteed_elements: {
				[2]: ElementType.FIRE,
				[3]: ElementType.FIRE,
				[4]: ElementType.FIRE,
				[5]: ElementType.FIRE,
				[6]: ElementType.FIRE,
				[7]: ElementType.WOOD,
				[8]: ElementType.WATER,
				[9]: ElementType.WATER,
				[10]: ElementType.LIGHTNING
			}
		},
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 12,
			wood: 3,
			water: 2,
			lightning: 2,
			air: 1
		},
		price: 20000,
		swfLetter: '1',
		skills: [Skill.CHARGE_CORNUE]
	},
	[RaceEnum.WINKS]: {
		raceId: RaceEnum.WINKS,
		name: 'winks',
		demon: {
			price: 700,
			skills: [Skill.DUR_A_CUIRE],
			// 0 fire, 1 wood, 4 water, 3 lightning, 1 air
			guaranteed_elements: {
				[2]: ElementType.WOOD,
				[3]: ElementType.WATER,
				[4]: ElementType.WATER,
				[5]: ElementType.WATER,
				[6]: ElementType.WATER,
				[7]: ElementType.LIGHTNING,
				[8]: ElementType.LIGHTNING,
				[9]: ElementType.LIGHTNING,
				[10]: ElementType.AIR
			}
		},
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 1,
			wood: 2,
			water: 9,
			lightning: 6,
			air: 2
		},
		price: 20000,
		swfLetter: '2',
		skills: [Skill.COQUE]
	},
	[RaceEnum.PLANAILLE]: {
		raceId: RaceEnum.PLANAILLE,
		name: 'planaille',
		demon: {
			price: 700,
			condition: {
				[ConditionEnum.PLAYER_EPIC]: Reward.BELIUS
			},
			skills: [Skill.FORCE_DES_TENEBRES],
			// 1 fire, 0 wood, 1 water, 5 lightning, 2 air
			guaranteed_elements: {
				[2]: ElementType.FIRE,
				[3]: ElementType.WATER,
				[4]: ElementType.LIGHTNING,
				[5]: ElementType.LIGHTNING,
				[6]: ElementType.LIGHTNING,
				[7]: ElementType.LIGHTNING,
				[8]: ElementType.LIGHTNING,
				[9]: ElementType.AIR,
				[10]: ElementType.AIR
			}
		},
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 0,
		upChance: {
			fire: 2,
			wood: 2,
			water: 2,
			lightning: 10,
			air: 4
		},
		price: 16000,
		swfLetter: '3'
	},
	[RaceEnum.CASTIVORE]: {
		raceId: RaceEnum.CASTIVORE,
		name: 'castivore',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 1,
		upChance: {
			fire: 2,
			wood: 8,
			water: 3,
			lightning: 2,
			air: 5
		},
		price: 16000,
		swfLetter: '4'
	},
	[RaceEnum.ROCKY]: {
		raceId: RaceEnum.ROCKY,
		name: 'rocky',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 4,
			wood: 2,
			water: 2,
			lightning: 11,
			air: 1
		},
		price: 18000,
		swfLetter: '5',
		skills: [Skill.ROCK]
	},
	[RaceEnum.PTEROZ]: {
		raceId: RaceEnum.PTEROZ,
		name: 'pteroz',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 3,
		upChance: {
			fire: 8,
			wood: 2,
			water: 1,
			lightning: 3,
			air: 6
		},
		price: 22000,
		swfLetter: '6'
	},
	[RaceEnum.NUAGOZ]: {
		raceId: RaceEnum.NUAGOZ,
		name: 'nuagoz',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 1,
			wood: 1,
			water: 6,
			lightning: 6,
			air: 6
		},
		price: 16000,
		swfLetter: '7'
	},
	[RaceEnum.SIRAIN]: {
		raceId: RaceEnum.SIRAIN,
		name: 'sirain',
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 2,
			water: 11,
			lightning: 2,
			air: 2
		},
		price: 16000,
		swfLetter: '8'
	},
	[RaceEnum.HIPPOCLAMP]: {
		raceId: RaceEnum.HIPPOCLAMP,
		name: 'hippoclamp',
		nbrFire: 1,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 4,
			wood: 4,
			water: 4,
			lightning: 4,
			air: 4
		},
		price: 28000,
		swfLetter: '9'
	},
	[RaceEnum.GORILLOZ]: {
		raceId: RaceEnum.GORILLOZ,
		name: 'gorilloz',
		demon: {
			price: 700,
			skills: [Skill.GROS_COSTAUD],
			// 1 fire, 6 wood, 1 water, 1 lightning, 0 air
			guaranteed_elements: {
				[2]: ElementType.FIRE,
				[3]: ElementType.WOOD,
				[4]: ElementType.WOOD,
				[5]: ElementType.WOOD,
				[6]: ElementType.WOOD,
				[7]: ElementType.WOOD,
				[8]: ElementType.WOOD,
				[9]: ElementType.WATER,
				[10]: ElementType.LIGHTNING
			}
		},
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 13,
			water: 1,
			lightning: 2,
			air: 1
		},
		price: 16000,
		swfLetter: 'A'
	},
	[RaceEnum.WANWAN]: {
		raceId: RaceEnum.WANWAN,
		name: 'wanwan',
		demon: {
			price: 900,
			skills: [Skill.FRENESIE_COLLECTIVE],
			// 1 fire, 2 wood, 1 water, 4 lightning, 1 air
			guaranteed_elements: {
				[2]: ElementType.FIRE,
				[3]: ElementType.WOOD,
				[4]: ElementType.WOOD,
				[5]: ElementType.WATER,
				[6]: ElementType.LIGHTNING,
				[7]: ElementType.LIGHTNING,
				[8]: ElementType.LIGHTNING,
				[9]: ElementType.LIGHTNING,
				[10]: ElementType.AIR
			}
		},
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 0,
		upChance: {
			fire: 3,
			wood: 6,
			water: 1,
			lightning: 8,
			air: 2
		},
		price: 19000,
		swfLetter: 'B'
	},
	[RaceEnum.SANTAZ]: {
		raceId: RaceEnum.SANTAZ,
		name: 'santaz',
		nbrFire: 1,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 2,
		upChance: {
			fire: 1,
			wood: 4,
			water: 2,
			lightning: 1,
			air: 12
		},
		price: 35000,
		swfLetter: 'C',
		skills: [Skill.PIETINEMENT]
	},
	[RaceEnum.FEROSS]: {
		raceId: RaceEnum.FEROSS,
		name: 'feross',
		nbrFire: 1,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 6,
			wood: 6,
			water: 6,
			lightning: 1,
			air: 1
		},
		price: 35000,
		swfLetter: 'D',
		skills: [Skill.CUIRASSE]
	},
	[RaceEnum.KABUKI]: {
		raceId: RaceEnum.KABUKI,
		name: 'kabuki',
		demon: {
			price: 800,
			condition: {
				[ConditionEnum.PLAYER_EPIC]: Reward.BELIUS
			},
			skills: [Skill.ORIGINE_CAUSHEMESHENNE],
			// 1 fire, 0 wood, 3 water, 1 lightning, 4 air
			guaranteed_elements: {
				[2]: ElementType.FIRE,
				[3]: ElementType.WATER,
				[4]: ElementType.WATER,
				[5]: ElementType.WATER,
				[6]: ElementType.LIGHTNING,
				[7]: ElementType.AIR,
				[8]: ElementType.AIR,
				[9]: ElementType.AIR,
				[10]: ElementType.AIR
			}
		},
		nbrFire: 0,
		nbrWood: 0,
		nbrWater: 1,
		nbrLightning: 0,
		nbrAir: 3,
		upChance: {
			fire: 2,
			wood: 2,
			water: 6,
			lightning: 2,
			air: 8
		},
		price: 35000,
		swfLetter: 'E',
		skills: [Skill.INSAISISSABLE]
	},
	[RaceEnum.MAHAMUTI]: {
		raceId: RaceEnum.MAHAMUTI,
		name: 'mahamuti',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 1,
			wood: 8,
			water: 8,
			lightning: 2,
			air: 1
		},
		price: 35000,
		swfLetter: 'F',
		skills: [Skill.ECRASEMENT]
	},
	[RaceEnum.SOUFFLET]: {
		raceId: RaceEnum.SOUFFLET,
		name: 'soufflet',
		nbrFire: 0,
		nbrWood: 1,
		nbrWater: 1,
		nbrLightning: 1,
		nbrAir: 2,
		upChance: {
			fire: 0,
			wood: 4,
			water: 4,
			lightning: 4,
			air: 8
		},
		price: 35000,
		swfLetter: 'G',
		skills: [Skill.NAPOMAGICIEN]
	},
	[RaceEnum.TOUFUFU]: {
		raceId: RaceEnum.TOUFUFU,
		name: 'toufufu',
		nbrFire: 0,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 0,
		upChance: {
			fire: 2,
			wood: 6,
			water: 1,
			lightning: 6,
			air: 5
		},
		price: 35000,
		swfLetter: 'H',
		skills: [Skill.DEPLACEMENT_INSTANTANE]
	},
	[RaceEnum.QUETZU]: {
		raceId: RaceEnum.QUETZU,
		name: 'quetzu',
		nbrFire: 2,
		nbrWood: 0,
		nbrWater: 2,
		nbrLightning: 0,
		nbrAir: 0,
		upChance: {
			fire: 8,
			wood: 2,
			water: 8,
			lightning: 2,
			air: 0
		},
		price: 35000,
		swfLetter: 'I'
	},
	[RaceEnum.SMOG]: {
		raceId: RaceEnum.SMOG,
		name: 'smog',
		nbrFire: 1,
		nbrWood: 0,
		nbrWater: 0,
		nbrLightning: 2,
		nbrAir: 2,
		upChance: {
			fire: 2,
			wood: 0,
			water: 4,
			lightning: 8,
			air: 6
		},
		price: 35000,
		swfLetter: 'J'
	},
	[RaceEnum.TRICERAGNON]: {
		raceId: RaceEnum.TRICERAGNON,
		name: 'triceragnon',
		nbrFire: 2,
		nbrWood: 2,
		nbrWater: 0,
		nbrLightning: 1,
		nbrAir: 1,
		upChance: {
			fire: 8,
			wood: 8,
			water: 0,
			lightning: 2,
			air: 2
		},
		price: 35000,
		swfLetter: 'K',
		skills: [Skill.BIGMAGNON]
	}
};

// 21 races en tout + 7 variantes démons = 28 races
