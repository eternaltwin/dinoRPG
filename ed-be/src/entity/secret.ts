import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Secret {
	@PrimaryColumn({
		nullable: false
	})
	key: string;

	@Column({
		nullable: false
	})
	value: string;

	constructor(key: string, value: string) {
		this.key = key;
		this.value = value;
	}
}
