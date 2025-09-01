#!/usr/bin/env node

import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { SimplifiedDinoz, SimplifiedFightResult, StatisticsService } from './index.js';
import { stringify } from "csv-stringify";
import fs from 'fs';
import { placeList } from '@drpg/core/models/place/PlaceList';

async function saveMonsterFightStatsToCSV(monsterFightStats: any[], filename: string = 'monster_fight_stats.csv'): Promise<void> {
    try {
      const csvString = await new Promise<string>((resolve, reject) => {
        stringify(monsterFightStats, {
          header: true,
          columns: {
            level: 'Level',
            minMonsters: 'Min Monsters',
            meanMonsters: 'Mean Monsters',
            maxMonsters: 'Max Monsters',
            xpMin: 'XP Min',
            xpMean: 'XP Mean',
            xpMax: 'XP Max',
            goldMin: 'Gold Min',
            goldMean: 'Gold Mean',
            goldMax: 'Gold Max'
          }
        }, (err, output) => {
          if (err) reject(err);
          else resolve(output);
        });
      });

      // Save to file
      await fs.writeFile(filename, csvString, 'utf8', err => {
		// When a request is aborted - the callback is called with an AbortError
	  });
      console.log(`Monster fight stats saved to ${filename}`);
    } catch (error) {
      console.error('Error saving monster fight stats to CSV:', error);
      throw error;
    }
  }

async function generateFightStatistics(group_size: number) {
	 
	const statsService = new StatisticsService();
  
	const MAX_LEVEL = 50;
	const RUN_COUNT = 1000;

	let places = [{place: PlaceEnum.DINOVILLE, minLevel: 1}, {place: PlaceEnum.FOSSELAVE, minLevel: 5}, {place: PlaceEnum.ILE_WAIKIKI, minLevel: 5}, {place: PlaceEnum.CAMP_KORGON, minLevel: 7}];

	for (const place of places) {

		let stats = [];

		for (let i = place.minLevel; i <= MAX_LEVEL; i++) {

			let team: SimplifiedDinoz[] = [];
			for (let j = 0; j < group_size; j++) {
				let dinoz: SimplifiedDinoz = {level: i, placeId: place.place, missions: [], playerId: `abc${j}`, id: 0, experience: 0, skills: [], status: [] };
				team.push(dinoz);
			}

			let results: SimplifiedFightResult[] = [];

			for (let j = 0; j <= RUN_COUNT; j++) {
				results.push(statsService.calculateMonstersStatistics(team, place.place));
			}

			let minMonsters = results.reduce((min, value) => {
				if (value.monsters.length < min) {
					return value.monsters.length;
				} else {
					return min;
				}
			}, Infinity);

			let monstersCount = results.reduce((partialTotal, value) => partialTotal + value.monsters.length, 0);
			let meanMonsters = monstersCount / RUN_COUNT;

			let maxMonsters = results.reduce((max, value) => {
				if (value.monsters.length > max) {
					return value.monsters.length;
				} else {
					return max;
				}
			}, 0);

			let xpMin = results.reduce((min, value) => {
				if (value.xp < min) {
					return value.xp;
				} else {
					return min;
				}
			}, Infinity);
			xpMin /= group_size;

			let totalXp = results.reduce((partialSum, value) => partialSum + value.xp, 0);
			let xpMean = (totalXp / RUN_COUNT) / group_size;

			let xpMax = results.reduce((max, value) => {
				if (value.xp > max) {
					return value.xp;
				} else {
					return max;
				}
			}, 0);
			xpMax /= group_size;


			let totalGold = results.reduce((partialSum, value) => partialSum + value.gold, 0);
			let goldMean = totalGold / RUN_COUNT;
			goldMean /= group_size;

			let goldMin = results.reduce((min, value) => {
				if (value.gold < min) {
					return value.gold;
				} else {
					return min;
				}
			}, Infinity);
			goldMin /= group_size;

			let goldMax = results.reduce((max, value) => {
				if (value.gold > max) {
					return value.gold;
				} else {
					return max;
				}
			}, 0);
			goldMax /= group_size;


			let monsterFightStats = {
				level: i,
				minMonsters,
				meanMonsters,
				maxMonsters,
				xpMin,
				xpMean,
				xpMax,
				goldMin,
				goldMean,
				goldMax,
			}

			stats.push(monsterFightStats);
		}
	
		let placeName = placeList[place.place].name;

		saveMonsterFightStatsToCSV(stats, `test-size-${group_size}-place-${placeName}-test5.csv`);
	}
}

async function main() {
	console.log('Starting DinoRPG Statistics...');
	// generateFightStatistics(1);
	generateFightStatistics(2);
	generateFightStatistics(3);
	generateFightStatistics(4);
	generateFightStatistics(5);
}

// Run main function and handle errors
main().catch((error) => {
  console.error('Error running statistics:', error);
  process.exit(1);
});