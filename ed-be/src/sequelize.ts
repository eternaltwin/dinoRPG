import dbConf from './config/db.config';
import { getEnvironnement } from './utils/context';
import { Sequelize } from 'sequelize-typescript';
import * as models from './models/database';

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
