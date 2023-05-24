import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Dinoz, Player } from './index.js';
import { GatherData } from '@drpg/core/models/gather/gatherData';
import { GatherPublicGrid } from '@drpg/core/models/gather/gatherPublicGrid';
import { GatherResultGrid } from '@drpg/core/models/gather/gatherResultGrid';
import { checkCondition } from '../utils/checkConditions.js';
import { GatherType } from '@drpg/core/models/enums/GatherType';

@Entity()
export class PlayerGather {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.gather, {
		onDelete: 'CASCADE'
	})
	player: Relation<Player>;

	@Column({
		nullable: false
	})
	place: number;

	@Column({
		nullable: false
	})
	type: GatherType;

	@Column('int', {
		nullable: false,
		array: true
	})
	grid: Array<Array<number>>;

	constructor(playerId: number, placeId: number, gridInformation: GatherData, gridId?: number) {
		this.player = new Player(playerId);
		this.place = placeId;
		if (gridId) this.id = gridId;
		if (!gridInformation) return;
		this.type = gridInformation.type;
		// Create arry with ingredientId. 0 for no element
		let grid = new Array(gridInformation.size);

		let placeIngredients = new Array(gridInformation.size * gridInformation.size);
		let ingredientCount = 0;
		//Generate a list of ingredient
		gridInformation.items.forEach(ingredient => {
			let buffer = new Array(ingredient.count);
			let ingredientId: number = ingredient.ingredientId;
			if (ingredient.type === 'item') ingredientId += 1000;
			buffer.fill(ingredientId);
			placeIngredients.splice(ingredientCount, ingredient.count, ...buffer);
			ingredientCount += ingredient.count;
		});

		//Fill the empty spot with 0
		placeIngredients = Array.from(placeIngredients, v => (v === undefined ? 0 : v));

		//Shuffle the ingredient list
		for (let i = placeIngredients.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[placeIngredients[i], placeIngredients[j]] = [placeIngredients[j], placeIngredients[i]];
		}

		//Split the list and fill it into the array of array (the grid)
		let row = 0;
		while (placeIngredients.length) {
			grid[row] = placeIngredients.splice(0, gridInformation.size);
			row++;
		}

		this.grid = grid;
	}
	public hideIngredients(): GatherPublicGrid {
		// -1 for already used box
		// 0 for not discovered box
		return this.grid.map(row => row.map(ingredient => (ingredient >= 0 ? 0 : -1)));
	}

	private getPublicGrid(): GatherResultGrid {
		return this.grid.map(row => row.map(ingredient => (ingredient >= 0 ? 0 : -1)));
	}

	public saveGrid(...box: Array<[number, number]>): Array<Array<number>> {
		for (let i = 0; i < box.length; i++) {
			this.grid[box[i][0]][box[i][1]] = -1;
		}
		return this.grid;
	}
	public discoverBox(dinoz: Dinoz, gridInformation: GatherData, ...box: Array<[number, number]>): GatherResultGrid {
		let returnGrid = this.getPublicGrid();
		for (let i = 0; i < box.length; i++) {
			let ingredientId: number = this.grid[box[i][0]][box[i][1]];
			if (ingredientId > 1000) ingredientId -= 1000;
			const ingredient = gridInformation.items.find(item => item.ingredientId === ingredientId);
			if (ingredient && ingredient.condition) {
				returnGrid[box[i][0]][box[i][1]] = checkCondition(ingredient.condition, dinoz) ? ingredient.ingredientId : -1;
			} else {
				returnGrid[box[i][0]][box[i][1]] = ingredientId > 0 ? ingredientId : -1;
			}
		}
		return returnGrid;
	}
}
