import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { ImportedDinoz } from './index.js';

@Entity()
export class ImportedDinozStatus {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ImportedDinoz, dinoz => dinoz.status, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	dinoz: Relation<ImportedDinoz>;

	@Column({
		nullable: false
	})
	statusId: number;
}
