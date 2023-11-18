import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dbConf from './config/db.config.js';
import { getEnvironnement } from './utils/context.js';
import {
	Concentration,
	Dinoz,
	PlayerGather,
	DinozItem,
	DinozMission,
	DinozSkill,
	DinozSkillUnlockable,
	DinozStatus,
	News,
	NPC,
	Player,
	PlayerDinozShop,
	PlayerIngredient,
	PlayerItem,
	PlayerQuest,
	PlayerReward,
	Ranking,
	ImportedPlayer,
	ImportedDinoz,
	ImportedPlayerReward,
	ImportedDinozSkill,
	ImportedPlayerItem,
	ImportedDinozStatus,
	ImportedPlayerScenario,
	ImportedPlayerIngredients,
	ImportedTwinoidStats,
	ImportedTwinoidAchievements,
	ImportedTwinoidSite,
	Secret
} from './entity/index.js';
import { DinozSubscriber } from './subscriber/index.js';

const dbConfig = dbConf(getEnvironnement());

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: dbConfig.HOST,
	port: 5432,
	username: dbConfig.USER,
	password: dbConfig.PASSWORD,
	database: dbConfig.DB,
	synchronize: false, // Set to true if schema need to be updated in dev
	logging: getEnvironnement() === 'development',
	entities: [
		Player,
		Dinoz,
		Concentration,
		PlayerGather,
		DinozItem,
		DinozMission,
		DinozSkill,
		DinozSkillUnlockable,
		DinozStatus,
		News,
		NPC,
		PlayerDinozShop,
		PlayerIngredient,
		PlayerItem,
		PlayerQuest,
		PlayerReward,
		Ranking,
		ImportedPlayer,
		ImportedDinoz,
		ImportedPlayerReward,
		ImportedDinozSkill,
		ImportedPlayerItem,
		ImportedDinozStatus,
		ImportedPlayerScenario,
		ImportedPlayerIngredients,
		ImportedTwinoidStats,
		ImportedTwinoidAchievements,
		ImportedTwinoidSite,
		Secret
	],
	migrations: ['dist/migration/*.js'],
	subscribers: [DinozSubscriber]
});
