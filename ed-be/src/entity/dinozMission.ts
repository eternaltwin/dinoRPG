import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Dinoz } from './index.js';

@Entity()
export class DinozMission {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Dinoz, dinoz => dinoz.skills, {
		onDelete: 'CASCADE'
	})
	dinoz: Relation<Dinoz>;

	@Column({
		nullable: false
	})
	missionId: number;
}
