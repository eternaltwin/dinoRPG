import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { ImportedPlayer } from './index.js';
import { scenarioAPI } from '@drpg/core/models/import/TwinoAPI';

@Entity()
export class ImportedPlayerScenario {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ImportedPlayer, player => player.scenario, {
		onDelete: 'CASCADE'
	})
	player: Relation<ImportedPlayer>;

	@Column({
		nullable: false
	})
	questName: string;

	@Column({
		nullable: false
	})
	progression: number;

	constructor(scenarioData: scenarioAPI) {
		if (!scenarioData) return;
		this.questName = scenarioData.id;
		this.progression = scenarioData.progress;
	}
}
