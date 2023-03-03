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

	@Column({
		nullable: false
	})
	step: number;

	@Column({
		nullable: true
	})
	progress: number;

	@Column({
		nullable: true
	})
	isFinished: boolean;

	constructor(dinoz: Dinoz, missionId: number) {
		this.dinoz = dinoz;
		this.missionId = missionId;
		this.step = 0;
		this.isFinished = false;
		this.progress = 0;
	}
}
