import { Entity, PrimaryGeneratedColumn, OneToMany, Relation } from 'typeorm';
import { Dinoz } from './index.js';

@Entity()
export class Concentration {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToMany(() => Dinoz, dinoz => dinoz.concentration, {
		cascade: ['update']
	})
	dinoz: Relation<Dinoz[]>;

	// constructor(dinoz: Dinoz) {
	//   // this.dinoz = [dinoz]
	// }
}
