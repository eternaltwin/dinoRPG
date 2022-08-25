import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Dinoz } from './index.js';

@Entity()
export class DinozSkill {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Dinoz, dinoz => dinoz.skills, {
		onDelete: 'CASCADE'
	})
	dinoz: Relation<Dinoz>;

	@Column({
		nullable: false
	})
	skillId: number;

	@Column({
		default: true
	})
	state: boolean;

	constructor(dinoz: Dinoz, skillId: number) {
		this.dinoz = dinoz;
		this.skillId = skillId;
	}
}
