import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Dinoz } from './index.js';

@Entity()
export class DinozSkillUnlockable {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Dinoz, dinoz => dinoz.skillsUnlockable, {
		onDelete: 'CASCADE'
	})
	dinoz: Relation<Dinoz>;

	@Column({
		nullable: false
	})
	skillId: number;

	constructor(dinoz: Dinoz, skillId: number) {
		this.dinoz = dinoz;
		this.skillId = skillId;
	}
}
