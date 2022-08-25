import fs from 'fs';
import toml from 'toml';

export default (config: string) => {
	const configuration = toml.parse(fs.readFileSync(`./config_${config}.toml`, 'utf-8'));

	return {
		HOST: configuration.db.host,
		USER: configuration.db.user,
		PASSWORD: configuration.db.password,
		DB: configuration.db.dbName,
		dialect: 'postgres',
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000
		}
	};
};
