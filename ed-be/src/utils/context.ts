import fs from 'fs';
import toml from 'toml';
import { Config } from '../models/index.js';

var config: Config;

const getEnvironnement = (): string => {
	const environment = process.env.NODE_ENV || 'development';
	return environment === 'development' ? 'dev' : 'prod';
};

const loadConfigFile = (): void => {
	config = toml.parse(
		fs.readFileSync(`./config_${getEnvironnement()}.toml`, 'utf-8')
	);
};

const getConfig = (): Config => {
	return config;
};

export { getEnvironnement, loadConfigFile, getConfig };
