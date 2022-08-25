import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Dinoz } from './index.js';

@Entity()
export class DinozStatus {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Dinoz, dinoz => dinoz.status, {
		onDelete: 'CASCADE'
	})
	dinoz: Relation<Dinoz>;

	@Column({
		nullable: false
	})
	statusId: number;

	constructor(dinoz: Dinoz, statusId: number) {
		this.dinoz = dinoz;
		this.statusId = statusId;
	}
}
