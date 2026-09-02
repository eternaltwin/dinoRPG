import { getGameConfig } from '@drpg/core/game.config';
import { GLOBAL } from '../context.js';

/**
 * Wrapper around the core method `getGameConfig` so it pulls automatically the proper config based on the environment.
 */
export const gameConfig = () => {
	return getGameConfig(GLOBAL.config.isProduction ? 'production' : 'development');
};
