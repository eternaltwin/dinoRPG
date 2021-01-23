import fs from 'fs';
import toml from 'toml';

var config;

const context = {

    getEnvironnement: () => {
        const environment = process.env.NODE_ENV || 'development';
        return environment === 'development' ? 'dev' : 'prod';
    },

    loadConfigFile: () => {
        config = toml.parse(fs.readFileSync('./config_' + context.getEnvironnement() + '.toml', 'utf-8'));
    },

    getConfig: () => {
        return config;
    }
}
export default context;