import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class News {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: true
	})
	title: string;

	@Column({
		type: 'bytea',
		nullable: true
	})
	image: Buffer;

	@Column({
		nullable: true
	})
	frenchTitle: string;

	@Column({
		nullable: true
	})
	frenchText: string;

	@Column({
		nullable: true
	})
	englishTitle: string;

	@Column({
		nullable: true
	})
	englishText: string;

	@Column({
		nullable: true
	})
	spanishTitle: string;

	@Column({
		nullable: true
	})
	spanishText: string;

	@Column({
		nullable: true
	})
	germanTitle: string;

	@Column({
		nullable: true
	})
	germanText: string;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;
}
