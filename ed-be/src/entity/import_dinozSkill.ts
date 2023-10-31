import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { ImportedDinoz } from './index.js';

@Entity()
export class ImportedDinozSkill {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ImportedDinoz, dinoz => dinoz.skills, {
		onDelete: 'CASCADE'
	})
	dinoz: Relation<ImportedDinoz>;

	@Column({
		nullable: false
	})
	skillId: number;
}
