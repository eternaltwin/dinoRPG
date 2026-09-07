import { getGameConfig } from '@drpg/core/game.config';

/**
 * Wrapper around the core method `getGameConfig` so it pulls automatically the proper config based on the environment.
 */
export const gameConfig = () => {
	return getGameConfig(import.meta.env.MODE);
};

export default gameConfig;
