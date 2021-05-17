import dbConf from './config/db.config.js';
import { getEnvironnement } from './utils/context.js';
import { Sequelize } from 'sequelize-typescript';
import * as models from './models/database/index.js';

const dbConfig = dbConf(getEnvironnement());

export const sequelize = new Sequelize(
	dbConfig.DB,
	dbConfig.USER,
	dbConfig.PASSWORD,
	{
		host: dbConfig.HOST,
		dialect: 'postgres',
		models: Object.values(models),

		pool: {
			max: dbConfig.pool.max,
			min: dbConfig.pool.min,
			acquire: dbConfig.pool.acquire,
			idle: dbConfig.pool.idle,
		},
	}
);
