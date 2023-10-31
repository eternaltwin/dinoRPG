import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { ImportedPlayer } from './index.js';
import { objectAPI } from '@drpg/core/models/import/TwinoAPI';
import { skillNameResolution } from '../constants/import/skillResolution.js';
import { accentsTidy } from '../utils/import.js';
import { itemResolution } from '../constants/import/itemResolution.js';
import { sendDiscord } from '../utils/discord.js';

@Entity()
export class ImportedPlayerItem {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ImportedPlayer, player => player.items, {
		onDelete: 'CASCADE'
	})
	player: Relation<ImportedPlayer>;

	@Column({
		nullable: false
	})
	itemId: number;

	@Column({
		nullable: false
	})
	quantity: number;

	constructor(itemId: number, quantity: number) {
		this.itemId = itemId;
		this.quantity = quantity;
	}
}
