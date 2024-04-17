import { Skill } from '../dinoz/SkillList.mjs';
import { MapZone } from '../enums/MapZone.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { GameEvent } from '../event/Events.mjs';
import { MonsterFiche } from './MonsterFiche.mjs';

export enum Monster {
	GOUPIGNON = 'GOUPIGNON',
	GOUPIGNON2 = 'GOUPIGNON2',
	GOUPIGNON3 = 'GOUPIGNON3',
	WOLF = 'WOLF',
	GLUON = 'GLUON',
	GREEN_GIANT = 'GREEN_GIANT',
	COQDUR = 'COQDUR',
	PIRASK = 'PIRASK',
	FLAM = 'FLAM',
	GOBLIN = 'GOBLIN',
	BARCHE = 'BARCHE',
	COBRA = 'COBRA',
	PIRA = 'PIRA',
	KAZKA = 'KAZKA',
	ANGUIL = 'ANGUIL',
	BORG = 'BORG',
	KORGON = 'KORGON',
	RONCIV = 'RONCIV',
	BAT = 'BAT',
	GRDIEN = 'GRDIEN',
	WORM2 = 'WORM2',
	WORM = 'WORM',
	SCORP = 'SCORP',
	CACTUS = 'CACTUS',
	BRIG1_ALL = 'BRIG1_ALL',
	BRIG1_HOME = 'BRIG1_HOME',
	BRIG2_ALL = 'BRIG2_ALL',
	BRIG2_HOME = 'BRIG2_HOME',
	BRIG3_ALL = 'BRIG3_ALL',
	BRIG3_HOME = 'BRIG3_HOME',
	GROPI = 'GROPI',
	MIMIC = 'MIMIC',
	EARTH2 = 'EARTH2',
	KORGON_REINFORCEMENT = 'KORGON_REINFORCEMENT',
	VEGETOX_GUARD = 'VEGETOX_GUARD',
	VEGETOX_GUARD_2 = 'VEGETOX_GUARD_2',
	FRUTOX_DEFENDER = 'FRUTOX_DEFENDER',
	GORILLOZ_SPIRIT = 'GORILLOZ_SPIRIT',
	BAMBOOZ_SPROUTING = 'BAMBOOZ_SPROUTING',
	PIGLOUNOU = 'PIGLOUNOU',
	PIGLOUBI = 'PIGLOUBI',
	PIGLOUGLOU = 'PIGLOUGLOU',
	SUPER_PIGLOU = 'SUPER_PIGLOU',
	ULTRA_PIGLOU = 'ULTRA_PIGLOU',
	FEBREZA = 'FEBREZA',
	PIRHANOS = 'PIRHANOS',
	PIRHANOS_2 = 'PIRHANOS_2',
	WEREZORE = 'WEREZORE',
	AMENCIAO = 'AMENCIAO',
	AMENPENNE = 'AMENPENNE',
	WILL_O = 'WILL_O',
	DARK_SMASHROOM = 'DARK_SMASHROOM',
	DARK_LEECH = 'DARK_LEECH',
	LONG_LEGGED_LEECH = 'LONG_LEGGED_LEECH',
	EARTHWORM_MATRIARCH = 'EARTHWORM_MATRIARCH',
	EARTHWORM_BABY = 'EARTHWORM_BABY',
	GROULEM = 'GROULEM',
	TW_BIGBEASTLY_1 = 'TW_BIGBEASTLY_1',
	STINGOZ = 'STINGOZ',
	SCORPWINK_THIEF = 'SCORPWINK_THIEF',
	SCORPWINK_THIEF_2 = 'SCORPWINK_THIEF_2',
	TRIPOU_THE_SOFTY = 'TRIPOU_THE_SOFTY',
	EMMEMA_BANDIT = 'EMMEMA_BANDIT',
	BARATRIBOR = 'BARATRIBOR',
	MERGUEZ_THIEF = 'MERGUEZ_THIEF',
	ELEMENTAL_DISCIPLE = 'ELEMENTAL_DISCIPLE',
	MINIMOUK = 'MINIMOUK',
	MINIMOUK_2 = 'MINIMOUK_2',
	MOUKTIZ = 'MOUKTIZ',
	MANTOOZE = 'MANTOOZE',
	FRUKOPTER = 'FRUKOPTER',
	DEMYOM = 'DEMYOM',
	DEMYOM_RUINS = 'DEMYOM_RUINS',
	DEMYOM_2 = 'DEMYOM_2',
	RAPACARAPACE = 'RAPACARAPACE',
	RAPACARAPACE_2 = 'RAPACARAPACE_2',
	BAOBOB = 'BAOBOB',
	SOLDIER = 'SOLDIER',
	CAPITAIN = 'CAPITAIN',
	ECURENNE = 'ECURENNE',
	GROMSTER = 'GROMSTER',
	PINK_GROMSTER = 'PINK_GROMSTER',
	SNOW_GROMSTER = 'SNOW_GROMSTER',
	CHIMCHEREE = 'CHIMCHEREE',
	LAPOUF = 'LAPOUF',
	ANY = 'ANY'
}

export const monsterList: Readonly<Record<Monster, MonsterFiche>> = {
	[Monster.GOUPIGNON]: {
		id: Monster.GOUPIGNON,
		name: 'goupignon',
		hp: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 33,
		level: 1,
		zones: [MapZone.DINOLAND],
		canBeCaptured: true,
		display: 'goupi'
	},
	[Monster.GOUPIGNON2]: {
		id: Monster.GOUPIGNON3,
		name: 'goupignon',
		hp: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 33,
		level: 1,
		zones: [MapZone.DINOLAND],
		canBeCaptured: true,
		display: 'goupi2'
	},
	[Monster.GOUPIGNON3]: {
		id: Monster.GOUPIGNON3,
		name: 'goupignon',
		hp: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 33,
		level: 1,
		zones: [MapZone.DINOLAND],
		canBeCaptured: true,
		display: 'goupi3'
	},
	[Monster.WOLF]: {
		id: Monster.WOLF,
		name: 'wolf',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 1,
		bonus_defense: 1,
		odds: 80,
		level: 5,
		zones: [MapZone.DINOLAND],
		groups: [5, 3, 1],
		canBeCaptured: true,
		skills: [Skill.M_BITE],
		display: 'wolf'
	},
	[Monster.GLUON]: {
		id: Monster.GLUON,
		name: 'gluon',
		hp: 35,
		elements: {
			air: 2,
			fire: 2,
			lightning: 2,
			water: 2,
			wood: 2
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 20,
		level: 7,
		zones: [MapZone.DINOLAND],
		canBeCaptured: true,
		skills: [Skill.M_ABSORPTION],
		display: 'gluon'
	},
	[Monster.GREEN_GIANT]: {
		id: Monster.GREEN_GIANT,
		name: 'greeng',
		hp: 70,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 3,
		bonus_defense: 6,
		odds: 100,
		level: 14,
		zones: [MapZone.DINOLAND],
		canBeCaptured: true,
		skills: [Skill.M_REGENERATION],
		display: 'gvert'
	},
	[Monster.COQDUR]: {
		id: Monster.COQDUR,
		name: 'coq',
		hp: 80,
		elements: {
			air: 3,
			fire: 3,
			lightning: 3,
			water: 3,
			wood: 3
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 50,
		level: 21,
		zones: [MapZone.DINOLAND],
		canBeCaptured: true,
		display: 'coq'
	},
	[Monster.PIRASK]: {
		id: Monster.PIRASK,
		name: 'pirask',
		hp: 15,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 30,
		odds: 50,
		level: 15,
		zones: [MapZone.DINOLAND],
		places: [PlaceEnum.CIMETIERE],
		groups: [0, 0, 1],
		canBeCaptured: true,
		skills: [Skill.M_FLIGHT]
	},
	[Monster.FLAM]: {
		id: Monster.FLAM,
		name: 'flam',
		hp: 10,
		xp: 7,
		elements: {
			fire: 1,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 100,
		level: 3,
		zones: [MapZone.GTOUTCHAUD],
		groups: [0, 3, 1],
		skills: [Skill.M_RENFORTS],
		canBeCaptured: true,
		display: 'flam'
	},
	[Monster.GOBLIN]: {
		id: Monster.GOBLIN,
		name: 'goblin',
		hp: 60,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 2,
		bonus_defense: 1,
		odds: 100,
		level: 5,
		zones: [MapZone.GTOUTCHAUD],
		canBeCaptured: true,
		display: 'goblin'
	},
	[Monster.BARCHE]: {
		id: Monster.BARCHE,
		name: 'barche',
		hp: 70,
		elements: {
			fire: 3,
			wood: 1,
			water: 2,
			lightning: 1,
			air: 1
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 20,
		level: 10,
		zones: [MapZone.GTOUTCHAUD],
		canBeCaptured: true,
		display: 'barche'
	},
	[Monster.COBRA]: {
		id: Monster.COBRA,
		name: 'cobra',
		hp: 100,
		elements: {
			fire: 5,
			wood: 0,
			water: 0,
			lightning: 4,
			air: 0
		},
		odds: 50,
		level: 20,
		zones: [MapZone.GTOUTCHAUD],
		canBeCaptured: true
	},
	[Monster.PIRA]: {
		id: Monster.PIRA,
		name: 'pira',
		hp: 5,
		elements: {
			fire: 0,
			wood: 0,
			water: 1,
			lightning: 0,
			air: 0
		},
		odds: 100,
		level: 6,
		zones: [MapZone.ILES],
		groups: [0, 0, 1],
		canBeCaptured: true,
		skills: [Skill.M_FLIGHT],
		display: 'pira'
	},
	[Monster.KAZKA]: {
		id: Monster.KAZKA,
		name: 'kazka',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 3,
		bonus_defense: 7,
		odds: 50,
		level: 8,
		zones: [MapZone.ILES],
		canBeCaptured: true,
		skills: [Skill.M_IMMATERIAL],
		display: 'kazka'
	},
	[Monster.ANGUIL]: {
		id: Monster.ANGUIL,
		name: 'anguil',
		hp: 120,
		elements: {
			fire: 2,
			wood: 0,
			water: 4,
			lightning: 0,
			air: 0
		},
		odds: 70,
		level: 18,
		zones: [MapZone.ILES],
		canBeCaptured: true,
		skills: [Skill.M_ELECTROCUTION],
		display: 'anguil'
	},
	[Monster.BORG]: {
		id: Monster.BORG,
		name: 'borg',
		hp: 100,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 40,
		odds: 50,
		level: 28,
		zones: [MapZone.ILES],
		skills: [Skill.M_RESISTANCE],
		canBeCaptured: false,
		display: 'borg'
	},
	[Monster.KORGON]: {
		id: Monster.KORGON,
		name: 'korgon',
		hp: 10,
		elements: {
			fire: 3,
			wood: 4,
			water: 0,
			lightning: 0,
			air: 0
		},
		odds: 100,
		level: 7,
		zones: [MapZone.JUNGLE],
		groups: [0, 2, 1],
		canBeCaptured: true,
		display: 'korgon'
	},
	[Monster.RONCIV]: {
		id: Monster.RONCIV,
		name: 'ronciv',
		hp: 70,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 6,
		bonus_defense: 15,
		odds: 100,
		level: 15,
		zones: [MapZone.JUNGLE],
		canBeCaptured: true,
		skills: [Skill.M_PROTECTION],
		noMove: true,
		display: 'ronciv'
	},
	[Monster.BAT]: {
		id: Monster.BAT,
		name: 'bat',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 25,
		bonus_defense: 18,
		odds: 50,
		level: 20,
		zones: [MapZone.JUNGLE],
		canBeCaptured: true,
		skills: [Skill.M_FLIGHT],
		display: 'bat'
	},
	[Monster.GRDIEN]: {
		id: Monster.GRDIEN,
		name: 'grdien',
		hp: 80,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 25,
		odds: 50,
		level: 25,
		zones: [MapZone.JUNGLE],
		canBeCaptured: true,
		skills: [Skill.M_COMET],
		noMove: true,
		display: 'grdien'
	},
	[Monster.WORM2]: {
		id: Monster.WORM2,
		name: 'worm2',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 6,
		bonus_defense: 10,
		odds: 50,
		level: 20,
		zones: [MapZone.STEPPE],
		canBeCaptured: true,
		skills: [Skill.M_WORM_2]
	},
	[Monster.WORM]: {
		id: Monster.WORM,
		name: 'worm',
		hp: 60,
		elements: {
			fire: 0,
			wood: 0,
			water: 10,
			lightning: 15,
			air: 0
		},
		odds: 50,
		level: 30,
		zones: [MapZone.STEPPE],
		canBeCaptured: true,
		skills: [Skill.M_WORM],
		noMove: true
	},
	[Monster.SCORP]: {
		id: Monster.SCORP,
		name: 'scorp',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 9,
			air: 0
		},
		odds: 50,
		level: 30,
		zones: [MapZone.STEPPE],
		canBeCaptured: true,
		skills: [Skill.M_STINGER]
	},
	[Monster.CACTUS]: {
		id: Monster.CACTUS,
		name: 'cactus',
		hp: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 40,
		bonus_defense: 130,
		odds: 50,
		level: 38,
		xp: 12,
		zones: [MapZone.STEPPE],
		canBeCaptured: true,
		skills: [Skill.M_POISONED_PICKS]
	},
	[Monster.BRIG1_ALL]: {
		id: Monster.BRIG1_ALL,
		name: 'brig1',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 70,
		bonus_defense: 0,
		odds: 10,
		level: 25,
		zones: [MapZone.STEPPE],
		groups: [0, 1],
		canBeCaptured: true,
		skills: [Skill.M_STEAL]
	},
	[Monster.BRIG1_HOME]: {
		id: Monster.BRIG1_HOME,
		name: 'brig1',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 70,
		bonus_defense: 0,
		odds: 500,
		level: 25,
		zones: [MapZone.STEPPE],
		places: [PlaceEnum.TAUDIS_DES_ZAXA],
		groups: [0, 1],
		canBeCaptured: true,
		skills: [Skill.M_STEAL]
	},
	[Monster.BRIG2_ALL]: {
		id: Monster.BRIG2_ALL,
		name: 'brig2',
		hp: 5,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 10,
		level: 25,
		xp: 6,
		zones: [MapZone.STEPPE],
		groups: [0, 0, 0, 1],
		canBeCaptured: true,
		skills: [Skill.M_STEAL]
	},
	[Monster.BRIG2_HOME]: {
		id: Monster.BRIG2_HOME,
		name: 'brig2',
		hp: 5,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 500,
		level: 25,
		xp: 6,
		zones: [MapZone.STEPPE],
		places: [PlaceEnum.CAMP_DES_EMMEMMA],
		groups: [0, 0, 0, 1],
		canBeCaptured: true,
		skills: [Skill.M_STEAL]
	},
	[Monster.BRIG3_ALL]: {
		id: Monster.BRIG3_ALL,
		name: 'brig3',
		hp: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 20,
		odds: 10,
		level: 25,
		xp: 7,
		zones: [MapZone.STEPPE],
		groups: [0, 0, 1],
		canBeCaptured: true,
		skills: [Skill.M_STEAL]
	},
	[Monster.BRIG3_HOME]: {
		id: Monster.BRIG3_HOME,
		name: 'brig3',
		hp: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 20,
		odds: 500,
		level: 25,
		xp: 7,
		zones: [MapZone.STEPPE],
		places: [PlaceEnum.CAMPEMENT_DES_MATTMUT],
		groups: [0, 0, 1],
		canBeCaptured: true,
		skills: [Skill.M_STEAL]
	},
	[Monster.GROPI]: {
		id: Monster.GROPI,
		name: 'gropi',
		hp: 10,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 15,
		bonus_defense: 25,
		odds: 100,
		level: 7,
		zones: [MapZone.DINOWEST],
		canBeCaptured: true,
		skills: [Skill.M_CONTAMINATION]
	},
	[Monster.MIMIC]: {
		id: Monster.MIMIC,
		name: 'mimic',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 30,
		bonus_defense: 50,
		odds: 100,
		level: 35,
		zones: [MapZone.DINOWEST],
		canBeCaptured: true
	},
	[Monster.EARTH2]: {
		id: Monster.EARTH2,
		name: 'earth2',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 40,
		odds: 100,
		level: 15,
		zones: [MapZone.DINOWEST],
		canBeCaptured: true
	},
	[Monster.KORGON_REINFORCEMENT]: {
		id: Monster.KORGON_REINFORCEMENT,
		name: 'rkrgns',
		hp: 10,
		elements: {
			fire: 1,
			wood: 3,
			water: 1,
			lightning: 1,
			air: 1
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 0,
		level: 0,
		zones: [MapZone.ALL],
		canBeCaptured: true
	},
	[Monster.VEGETOX_GUARD]: {
		id: Monster.VEGETOX_GUARD,
		name: 'mugard',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 30,
		bonus_defense: 15,
		odds: 100,
		level: 22,
		zones: [],
		places: [
			PlaceEnum.PORT_MONSTRUEUX,
			PlaceEnum.AVANT_POSTE_VEGETOX,
			PlaceEnum.PALAIX_D_ANTRAXOV,
			PlaceEnum.CAMP_D_ELITE
		],
		skills: [Skill.VIGNES, Skill.M_VEGETOX_DEFENDER],
		canBeCaptured: true
	},
	[Monster.VEGETOX_GUARD_2]: {
		id: Monster.VEGETOX_GUARD_2,
		name: 'veginf',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 30,
		bonus_defense: 15,
		odds: 0,
		level: 22,
		zones: [],
		skills: [Skill.M_VEGETOX_DEFENDER, Skill.M_INFINITE_REINFORCEMENTS],
		canBeCaptured: true
	},
	[Monster.FRUTOX_DEFENDER]: {
		id: Monster.FRUTOX_DEFENDER,
		name: 'frutox',
		hp: 50,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 30,
		bonus_defense: 20,
		odds: 100,
		level: 22,
		zones: [],
		places: [
			PlaceEnum.PORT_MONSTRUEUX,
			PlaceEnum.AVANT_POSTE_FRUTOX,
			PlaceEnum.PALAIS_DU_GROTOX,
			PlaceEnum.FORET_KAZE_KAMI
		],
		skills: [Skill.M_FASTER],
		canBeCaptured: true
	},
	[Monster.GORILLOZ_SPIRIT]: {
		id: Monster.GORILLOZ_SPIRIT,
		name: 'egrllz',
		hp: 40,
		elements: {
			fire: 5,
			wood: 8,
			water: 3,
			lightning: 3,
			air: 3
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 0,
		level: 0,
		zones: [MapZone.ALL],
		canBeCaptured: true
	},
	[Monster.BAMBOOZ_SPROUTING]: {
		id: Monster.BAMBOOZ_SPROUTING,
		name: 'bamboo',
		hp: 30,
		elements: {
			fire: 0,
			wood: 4,
			water: 0,
			lightning: 4,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 0,
		level: 0,
		zones: [MapZone.ALL],
		canBeCaptured: true
	},
	[Monster.PIGLOUNOU]: {
		id: Monster.PIGLOUNOU,
		name: 'piglou',
		zones: [MapZone.DINOLAND],
		level: 5,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 5,
		bonus_defense: 3,
		odds: 10,
		hp: 50,
		xp: 40,
		skills: [],
		canBeCaptured: false,
		events: [GameEvent.CHRISTMAS]
	},
	[Monster.PIGLOUBI]: {
		id: Monster.PIGLOUBI,
		name: 'piglo2',
		zones: [MapZone.DINOLAND],
		level: 10,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 20,
		bonus_defense: 15,
		odds: 10,
		hp: 50,
		xp: 40,
		skills: [],
		canBeCaptured: false,
		events: [GameEvent.CHRISTMAS]
	},
	[Monster.PIGLOUGLOU]: {
		id: Monster.PIGLOUGLOU,
		name: 'piglo3',
		zones: [MapZone.DINOLAND],
		level: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 40,
		bonus_defense: 30,
		odds: 10,
		hp: 50,
		xp: 40,
		skills: [],
		canBeCaptured: false,
		events: [GameEvent.CHRISTMAS]
	},
	[Monster.SUPER_PIGLOU]: {
		id: Monster.SUPER_PIGLOU,
		name: 'piglo4',
		zones: [MapZone.DINOLAND],
		level: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 60,
		bonus_defense: 45,
		odds: 10,
		hp: 50,
		xp: 40,
		skills: [],
		canBeCaptured: false,
		events: [GameEvent.CHRISTMAS]
	},
	[Monster.ULTRA_PIGLOU]: {
		id: Monster.ULTRA_PIGLOU,
		name: 'piglo5',
		zones: [MapZone.DINOLAND],
		level: 40,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 80,
		bonus_defense: 50,
		odds: 10,
		hp: 50,
		xp: 40,
		skills: [],
		canBeCaptured: false,
		events: [GameEvent.CHRISTMAS]
	},
	[Monster.FEBREZA]: {
		id: Monster.FEBREZA,
		name: 'febrez',
		zones: [MapZone.ALL],
		level: 0,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 10,
		odds: 30,
		hp: 30,
		xp: 100,
		skills: [Skill.M_FEBREZ],
		canBeCaptured: false,
		events: [GameEvent.VALENTINE]
	},
	[Monster.PIRHANOS]: {
		id: Monster.PIRHANOS,
		name: 'piraos',
		zones: [MapZone.DARKWORLD],
		level: 15,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 30,
		odds: 100,
		hp: 15,
		groups: [0, 0, 1],
		skills: [Skill.M_FLIGHT],
		canBeCaptured: false
	},
	[Monster.PIRHANOS_2]: {
		id: Monster.PIRHANOS_2,
		name: 'pirao2',
		zones: [MapZone.DARKWORLD],
		level: 15,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 30,
		odds: 100,
		hp: 10,
		skills: [Skill.M_FLIGHT],
		canBeCaptured: true
	},
	[Monster.WEREZORE]: {
		id: Monster.WEREZORE,
		name: 'garouz',
		zones: [MapZone.DARKWORLD],
		level: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 30,
		bonus_defense: 30,
		odds: 100,
		hp: 30,
		canBeCaptured: false
	},
	[Monster.AMENCIAO]: {
		id: Monster.AMENCIAO,
		name: 'amanpe',
		zones: [MapZone.DARKWORLD],
		places: [PlaceEnum.DARK_FAKE],
		level: 25,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 20,
		groups: [1, 3, 2],
		odds: 100,
		hp: 30,
		xpBonus: 5,
		canBeCaptured: false
	},
	[Monster.AMENPENNE]: {
		id: Monster.AMENPENNE,
		name: 'amanp2',
		zones: [MapZone.DARKWORLD],
		level: 25,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 50,
		bonus_defense: 20,
		groups: [2, 1, 0],
		odds: 100,
		hp: 30,
		xpBonus: 5,
		canBeCaptured: false
	},
	[Monster.WILL_O]: {
		id: Monster.WILL_O,
		name: 'feufol',
		zones: [MapZone.DARKWORLD],
		places: [PlaceEnum.DARK_FAKE_2],
		level: 55,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 60,
		bonus_defense: 30,
		groups: [2, 1, 0],
		odds: 100,
		hp: 80,
		xpBonus: 10,
		canBeCaptured: false
	},
	[Monster.DARK_SMASHROOM]: {
		id: Monster.DARK_SMASHROOM,
		name: 'darkgp',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 80,
		bonus_defense: 50,
		odds: 0,
		level: 30,
		zones: [MapZone.ALL],
		canBeCaptured: true
	},
	[Monster.DARK_LEECH]: {
		id: Monster.DARK_LEECH,
		name: 'sangsa',
		hp: 200,
		elements: {
			fire: 20,
			wood: 5,
			water: 30,
			lightning: 20,
			air: 30
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 0,
		level: 72,
		groups: [1, 1, 0],
		xp: 50,
		xpBonus: 15,
		skills: [Skill.PERCEPTION, Skill.M_RENFORTS],
		zones: [MapZone.DINOLAND, MapZone.ILES],
		canBeCaptured: true
	},
	[Monster.LONG_LEGGED_LEECH]: {
		id: Monster.LONG_LEGGED_LEECH,
		name: 'sangs2',
		hp: 300,
		elements: {
			fire: 25,
			wood: 20,
			water: 10,
			lightning: 35,
			air: 10
		},
		bonus_attack: 0,
		bonus_defense: 0,
		odds: 0,
		level: 75,
		groups: [1, 0, 0],
		xp: 70,
		xpBonus: 15,
		skills: [Skill.PERCEPTION, Skill.M_RENFORTS],
		zones: [MapZone.DINOLAND, MapZone.ILES],
		canBeCaptured: true
	},
	[Monster.EARTHWORM_MATRIARCH]: {
		id: Monster.EARTHWORM_MATRIARCH,
		name: 'wormom',
		level: 35,
		elements: {
			fire: 0,
			wood: 0,
			water: 15,
			lightning: 20,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 160,
		odds: 100,
		skills: [Skill.COQUE, Skill.M_ELECTROCUTION, Skill.M_WORM, Skill.EMBUCHE, Skill.M_WORM_CALL],
		zones: [],
		canBeCaptured: true,
		noMove: true
	},
	[Monster.EARTHWORM_BABY]: {
		id: Monster.EARTHWORM_BABY,
		name: 'wormy',
		level: 15,
		elements: {
			fire: 0,
			wood: 0,
			water: 5,
			lightning: 10,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 30,
		odds: 100,
		skills: [Skill.FOUDRE, Skill.M_WORM],
		zones: [],
		canBeCaptured: true,
		noMove: true
	},
	[Monster.GROULEM]: {
		id: Monster.GROULEM,
		name: 'groule',
		places: [
			// TODO: add Caushemesh places
		],
		level: 54,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 60,
		bonus_defense: 70,
		hp: 80,
		odds: 100,
		xp: 30,
		skills: [Skill.M_ELECTROCUTION],
		zones: [],
		canBeCaptured: false
	},
	[Monster.TW_BIGBEASTLY_1]: {
		id: Monster.TW_BIGBEASTLY_1,
		name: 'wbour1',
		level: 35,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 300,
		odds: 100,
		xp: 0,
		skills: [Skill.M_DISABLE],
		zones: [],
		canBeCaptured: false
	},
	[Monster.STINGOZ]: {
		id: Monster.STINGOZ,
		name: 'pikouz',
		level: 25,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 12,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 50,
		odds: 100,
		skills: [Skill.M_STINGER],
		zones: [],
		canBeCaptured: true
	},
	[Monster.SCORPWINK_THIEF]: {
		id: Monster.SCORPWINK_THIEF,
		name: 'thief',
		level: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 9,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 1000,
		odds: 100,
		skills: [Skill.M_STEAL, Skill.ATTAQUE_ECLAIR, Skill.CELERITE, Skill.M_STINGER, Skill.M_FLEE],
		zones: [],
		canBeCaptured: true
	},
	[Monster.SCORPWINK_THIEF_2]: {
		id: Monster.SCORPWINK_THIEF_2,
		name: 'thief2',
		level: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 9,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 50,
		odds: 100,
		skills: [Skill.M_STEAL, Skill.ATTAQUE_ECLAIR, Skill.M_STINGER],
		zones: [],
		canBeCaptured: true
	},
	[Monster.TRIPOU_THE_SOFTY]: {
		id: Monster.TRIPOU_THE_SOFTY,
		name: 'tripo2',
		level: 25,
		elements: {
			fire: 10,
			wood: 10,
			water: 10,
			lightning: 10,
			air: 10
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 9999,
		odds: 100,
		skills: [Skill.M_INSTANT_FLEE, Skill.EMBUCHE],
		xp: 1,
		zones: [],
		canBeCaptured: true
	},
	[Monster.EMMEMA_BANDIT]: {
		id: Monster.EMMEMA_BANDIT,
		name: 'coward',
		level: 25,
		elements: {
			fire: 10,
			wood: 10,
			water: 10,
			lightning: 10,
			air: 10
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 9999,
		odds: 100,
		skills: [Skill.M_INSTANT_FLEE, Skill.EMBUCHE],
		xp: 1,
		zones: [],
		canBeCaptured: true
	},
	[Monster.MERGUEZ_THIEF]: {
		id: Monster.MERGUEZ_THIEF,
		name: 'vol1',
		level: 35,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 50,
		odds: 100,
		skills: [Skill.M_STEAL],
		xp: 10,
		zones: [],
		canBeCaptured: true
	},
	[Monster.BARATRIBOR]: {
		id: Monster.BARATRIBOR,
		name: 'baratr',
		level: 15,
		elements: {
			fire: 0,
			wood: 3,
			water: 6,
			lightning: 6,
			air: 3
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 70,
		odds: 100,
		skills: [Skill.COUP_DOUBLE],
		zones: [],
		canBeCaptured: true
	},
	[Monster.ELEMENTAL_DISCIPLE]: {
		id: Monster.ELEMENTAL_DISCIPLE,
		name: 'elhelp',
		level: 0,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 20,
		bonus_defense: 20,
		hp: 200,
		odds: 100,
		skills: [Skill.M_ELEMENTAL_DISCIPLE],
		zones: [],
		canBeCaptured: true
	},
	[Monster.MINIMOUK]: {
		id: Monster.MINIMOUK,
		name: 'minimo',
		level: 6,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 20,
		hp: 10,
		groups: [0, 1, 6, 2, 1],
		odds: 100,
		skills: [Skill.M_ALL_FOR_ONE],
		zones: [MapZone.ILEMONSTRE],
		canBeCaptured: true
	},
	[Monster.MINIMOUK_2]: {
		id: Monster.MINIMOUK_2,
		name: 'minim2',
		level: 6,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 20,
		hp: 10,
		groups: [0, 1, 6, 2, 1],
		odds: 0,
		skills: [Skill.M_ALL_FOR_ONE],
		xp: 3,
		zones: [],
		canBeCaptured: true
	},
	[Monster.MOUKTIZ]: {
		id: Monster.MOUKTIZ,
		name: 'mosqui',
		level: 20,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 0,
		bonus_defense: 60,
		hp: 30,
		odds: 100,
		skills: [Skill.M_UNTOUCHABLE, Skill.M_INITIATIVE_RESET],
		zones: [MapZone.ILEMONSTRE],
		canBeCaptured: true
	},
	[Monster.MANTOOZE]: {
		id: Monster.MANTOOZE,
		name: 'mantoo',
		level: 25,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 40,
		bonus_defense: 10,
		hp: 50,
		odds: 100,
		skills: [Skill.M_LAST_BREATH, Skill.M_HEAL_GROUP],
		zones: [MapZone.ILEMONSTRE],
		canBeCaptured: true
	},
	[Monster.FRUKOPTER]: {
		id: Monster.FRUKOPTER,
		name: 'ffrutx',
		level: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 40,
		bonus_defense: 15,
		hp: 70,
		odds: 100,
		skills: [Skill.M_FRUKOPTER_FLIGHT],
		zones: [MapZone.ILEMONSTRE],
		canBeCaptured: true
	},
	[Monster.DEMYOM]: {
		id: Monster.DEMYOM,
		name: 'singmu',
		level: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 40,
		bonus_defense: 15,
		hp: 100,
		odds: 5,
		skills: [],
		zones: [],
		places: [PlaceEnum.FORET_KAZE_KAMI, PlaceEnum.CAMP_D_ELITE],
		canBeCaptured: true
	},
	[Monster.DEMYOM_RUINS]: {
		id: Monster.DEMYOM_RUINS,
		name: 'singmu',
		level: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 40,
		bonus_defense: 15,
		hp: 100,
		odds: 10,
		skills: [],
		zones: [],
		places: [PlaceEnum.RUINES_DE_CUSCOUZ],
		canBeCaptured: true
	},
	[Monster.DEMYOM_2]: {
		id: Monster.DEMYOM_2,
		name: 'singm2',
		level: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 40,
		bonus_defense: 15,
		hp: 30,
		odds: 10,
		skills: [],
		zones: [],
		places: [PlaceEnum.RUINES_DE_CUSCOUZ],
		canBeCaptured: true
	},
	[Monster.RAPACARAPACE]: {
		id: Monster.RAPACARAPACE,
		name: 'rapaca',
		level: 40,
		elements: {
			fire: 4,
			wood: 3,
			water: 5,
			lightning: 3,
			air: 23
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 150,
		odds: 0,
		skills: [Skill.M_TORNADO, Skill.M_AIR_BLADE],
		zones: [],
		canBeCaptured: true
	},
	[Monster.RAPACARAPACE_2]: {
		id: Monster.RAPACARAPACE_2,
		name: 'rapac2',
		level: 25,
		elements: {
			fire: 5,
			wood: 2,
			water: 4,
			lightning: 3,
			air: 10
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 115,
		odds: 0,
		skills: [Skill.M_TORNADO, Skill.M_AIR_BLADE],
		zones: [],
		canBeCaptured: true
	},
	[Monster.BAOBOB]: {
		id: Monster.BAOBOB,
		name: 'bao',
		level: 70,
		elements: {
			fire: 50,
			wood: 50,
			water: 50,
			lightning: 50,
			air: 50
		},
		bonus_attack: 0,
		bonus_defense: 0,
		hp: 6500,
		xp: 0,
		gold: 0,
		odds: 0,
		skills: [
			Skill.CELERITE,
			Skill.ATTAQUE_ECLAIR,
			Skill.FOUDRE,
			Skill.SOUFFLE_ARDENT,
			Skill.SALAMANDRE,
			Skill.DELUGE,
			Skill.BULLE
		],
		zones: [],
		canBeCaptured: true
	},
	[Monster.SOLDIER]: {
		id: Monster.SOLDIER,
		name: 'cyclo',
		level: 35,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 55,
		bonus_defense: 30,
		hp: 50,
		xpBonus: 4,
		odds: 100,
		groups: [1, 2],
		skills: [Skill.PERCEPTION],
		zones: [],
		places: [
			PlaceEnum.TETE_DE_L_ILE,
			PlaceEnum.PONT,
			PlaceEnum.CITE_ARBORIS,
			PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR,
			PlaceEnum.CHUTES_DE_NIRVANA,
			PlaceEnum.LAC_CELESTE
		],
		canBeCaptured: false
	},
	[Monster.CAPITAIN]: {
		id: Monster.CAPITAIN,
		name: 'cyclo2',
		level: 45,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 85,
		bonus_defense: 45,
		hp: 70,
		xpBonus: 5,
		odds: 100,
		groups: [0, 4, 2],
		skills: [Skill.SANS_PITIE],
		zones: [],
		places: [PlaceEnum.CITE_ARBORIS, PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR, PlaceEnum.PRIRANESE],
		canBeCaptured: false
	},
	[Monster.ECURENNE]: {
		id: Monster.ECURENNE,
		name: 'ecu',
		level: 37,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 60,
		bonus_defense: 40,
		hp: 65,
		xpBonus: 3,
		odds: 100,
		groups: [0, 1, 1],
		skills: [Skill.PERCEPTION],
		zones: [],
		places: [
			PlaceEnum.TETE_DE_L_ILE,
			PlaceEnum.PONT,
			PlaceEnum.CHUTES_DE_NIRVANA,
			PlaceEnum.LAC_CELESTE,
			PlaceEnum.AILE_OUEST_DU_DRAGON,
			PlaceEnum.MONT_SACRE_D_EVEROUEST,
			PlaceEnum.PLAINES_ENNEIGEES,
			PlaceEnum.BOIS_GIVRES,
			PlaceEnum.CHEMIN_OBSERVATOIRE,
			PlaceEnum.OBSERVATOIRE
		],
		canBeCaptured: true
	},
	[Monster.GROMSTER]: {
		id: Monster.GROMSTER,
		name: 'groms',
		level: 32,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 55,
		bonus_defense: 45,
		hp: 40,
		xpBonus: 3,
		odds: 100,
		groups: [0, 3, 5],
		skills: [Skill.PERCEPTION],
		zones: [],
		places: [
			PlaceEnum.TETE_DE_L_ILE,
			PlaceEnum.PONT,
			PlaceEnum.CITE_ARBORIS,
			PlaceEnum.PORTE_DE_NIVEAU_SUPERIEUR,
			PlaceEnum.CHUTES_DE_NIRVANA,
			PlaceEnum.LAC_CELESTE,
			PlaceEnum.GO_TO_CELESTIAL_ISLAND,
			PlaceEnum.CHEMIN_OBSERVATOIRE,
			PlaceEnum.OBSERVATOIRE
		],
		canBeCaptured: true
	},
	[Monster.PINK_GROMSTER]: {
		id: Monster.PINK_GROMSTER,
		name: 'grom2',
		level: 39,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 60,
		bonus_defense: 55,
		hp: 50,
		xpBonus: 6,
		odds: 100,
		groups: [2, 5],
		skills: [Skill.PERCEPTION],
		zones: [],
		places: [
			PlaceEnum.PONT,
			PlaceEnum.CHUTES_DE_NIRVANA,
			PlaceEnum.LAC_CELESTE,
			PlaceEnum.AILE_OUEST_DU_DRAGON,
			PlaceEnum.SOMMET_DU_MONT_SACRE
		],
		canBeCaptured: true
	},
	[Monster.SNOW_GROMSTER]: {
		id: Monster.SNOW_GROMSTER,
		name: 'grom3',
		level: 45,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 75,
		bonus_defense: 55,
		hp: 120,
		xpBonus: 5,
		xp: 18,
		odds: 40,
		skills: [Skill.COUP_DOUBLE],
		zones: [],
		places: [
			PlaceEnum.MONT_SACRE_D_EVEROUEST,
			PlaceEnum.SOMMET_DU_MONT_SACRE,
			PlaceEnum.BOIS_GIVRES,
			PlaceEnum.PLAINES_ENNEIGEES
		],
		canBeCaptured: false
	},
	[Monster.CHIMCHEREE]: {
		id: Monster.CHIMCHEREE,
		name: 'chima',
		level: 55,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 75,
		bonus_defense: 55,
		hp: 140,
		xp: 40,
		odds: 100,
		skills: [],
		zones: [],
		places: [
			PlaceEnum.PORTES_DE_CAUSHEMESH
			// TODO: Add caushemesh places
		],
		canBeCaptured: false
	},
	[Monster.LAPOUF]: {
		id: Monster.LAPOUF,
		name: 'lapouf',
		level: 42,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 65,
		bonus_defense: 40,
		hp: 50,
		xpBonus: 4,
		odds: 100,
		groups: [0, 5, 3],
		skills: [Skill.PERCEPTION],
		zones: [],
		places: [
			PlaceEnum.TETE_DE_L_ILE,
			PlaceEnum.PONT,
			PlaceEnum.CHUTES_DE_NIRVANA,
			PlaceEnum.LAC_CELESTE,
			PlaceEnum.AILE_OUEST_DU_DRAGON,
			PlaceEnum.MONT_SACRE_D_EVEROUEST,
			PlaceEnum.PLAINES_ENNEIGEES,
			PlaceEnum.BOIS_GIVRES,
			PlaceEnum.SOMMET_DU_MONT_SACRE,
			PlaceEnum.CHEMIN_OBSERVATOIRE,
			PlaceEnum.OBSERVATOIRE
		],
		canBeCaptured: true
	},
	[Monster.ANY]: {
		id: Monster.ANY,
		name: 'any',
		hp: 30,
		elements: {
			fire: 0,
			wood: 0,
			water: 0,
			lightning: 0,
			air: 0
		},
		bonus_attack: 10,
		bonus_defense: 40,
		odds: 1,
		level: 100,
		zones: [MapZone.NOWHERE],
		canBeCaptured: true
	}
};
