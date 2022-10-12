import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Dinoz } from './index.js';

@Entity()
export class NPC {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Dinoz, dinoz => dinoz.NPC, {
		onDelete: 'CASCADE'
	})
	dinoz: Relation<Dinoz>;

	@Column({
		nullable: false
	})
	npcId: number;

	@Column({
		nullable: false
	})
	step: string;

	constructor(dinoz: Dinoz, npcId: number, step: string) {
		this.dinoz = dinoz;
		this.npcId = npcId;
		this.step = step;
	}
}
