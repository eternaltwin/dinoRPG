import fs from 'fs';
import toml from 'toml';
import { Config } from '../models/index.js';

let config: Config;

const getEnvironnement = (): string => {
	return process.env.NODE_ENV ?? 'development';
};

const loadConfigFile = (): void => {
	config = toml.parse(fs.readFileSync(`./config_${getEnvironnement()}.toml`, 'utf-8'));
};

const getConfig = (): Config => {
	return config;
};

export { getEnvironnement, loadConfigFile, getConfig };
