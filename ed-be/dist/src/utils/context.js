"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.loadConfigFile = exports.getEnvironnement = void 0;
const fs_1 = __importDefault(require("fs"));
const toml_1 = __importDefault(require("toml"));
var config;
const getEnvironnement = () => {
    const environment = process.env.NODE_ENV || 'development';
    return environment === 'development' ? 'dev' : 'prod';
};
exports.getEnvironnement = getEnvironnement;
const loadConfigFile = () => {
    config = toml_1.default.parse(fs_1.default.readFileSync(`./config_${getEnvironnement()}.toml`, 'utf-8'));
};
exports.loadConfigFile = loadConfigFile;
const getConfig = () => {
    return config;
};
exports.getConfig = getConfig;
//# sourceMappingURL=context.js.map