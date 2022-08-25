import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Relation } from 'typeorm';
import { Dinoz } from './index.js';

@Entity()
export class DinozItem {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToMany(() => Dinoz, {
		onDelete: 'CASCADE'
	})
	dinoz: Relation<Dinoz>;

	@Column({
		nullable: false
	})
	itemId: number;
}
