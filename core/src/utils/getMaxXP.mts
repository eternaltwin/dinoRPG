import { levelList } from '../models/dinoz/DinozLevel.mjs';

export const getMaxXP = (level: number) => {
	const levelData = levelList.find(lvl => lvl.id === level);

	if (!levelData) {
		throw new Error(`Level ${level} not found`);
	}

	return levelData.experience;
};
