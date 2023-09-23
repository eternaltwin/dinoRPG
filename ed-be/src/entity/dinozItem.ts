import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Dinoz } from './index.js';

@Entity()
export class DinozItem {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Dinoz, dinoz => dinoz.items, {
		onDelete: 'CASCADE'
	})
	dinoz: Relation<Dinoz>;

	@Column({
		nullable: false
	})
	itemId: number;

	constructor(dinoz: Dinoz, itemId: number) {
		this.dinoz = dinoz;
		this.itemId = itemId;
	}
}
