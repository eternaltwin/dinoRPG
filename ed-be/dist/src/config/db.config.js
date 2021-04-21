"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const toml_1 = __importDefault(require("toml"));
function default_1(config) {
    const configuration = toml_1.default.parse(fs_1.default.readFileSync(`./config_${config}.toml`, 'utf-8'));
    const dbConfig = {
        HOST: configuration.db.host,
        USER: configuration.db.user,
        PASSWORD: configuration.db.password,
        DB: configuration.db.dbName,
        dialect: 'postgres',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    };
    return dbConfig;
}
exports.default = default_1;
//# sourceMappingURL=db.config.js.map