import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	Relation,
	UpdateDateColumn
} from 'typeorm';
import { ImportedDinozSkill, ImportedDinozStatus, ImportedPlayer } from './index.js';
import { dinoAPI } from '@drpg/core/models/import/TwinoAPI';
import { ImportDinoz } from '@drpg/core/models/import/importDinoz';
import { raceList } from '@drpg/core/models/dinoz/RaceList';

@Entity()
export class ImportedDinoz {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => ImportedPlayer, player => player.dinoz, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	player: Relation<ImportedPlayer>;

	@OneToMany(() => ImportedDinozSkill, skill => skill.dinoz, {
		cascade: true
	})
	skills: Relation<ImportedDinozSkill[]>;

	@OneToMany(() => ImportedDinozStatus, status => status.dinoz, {
		cascade: true
	})
	status: Relation<ImportedDinozStatus[]>;

	@Column({
		nullable: false
	})
	importedId: number;

	@Column({
		nullable: false
	})
	name: string;

	@Column({
		nullable: false,
		default: false
	})
	isSacrificed: boolean;

	@Column({
		nullable: false
	})
	isFrozen: boolean;

	@Column({
		nullable: false
	})
	level: number;

	@Column({
		nullable: false
	})
	display: string;

	@Column({
		nullable: false
	})
	life: number;

	@Column({
		nullable: false
	})
	maxLife: number;

	@Column({
		nullable: false
	})
	experience: number;

	@Column({
		nullable: false
	})
	nbrUpFire: number;

	@Column({
		nullable: false
	})
	nbrUpWood: number;

	@Column({
		nullable: false
	})
	nbrUpWater: number;

	@Column({
		nullable: false
	})
	nbrUpLightning: number;

	@Column({
		nullable: false
	})
	nbrUpAir: number;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;

	constructor(dinoData?: dinoAPI, sacrified?: boolean) {
		if (!dinoData) return;
		this.importedId = dinoData.id;
		this.name = dinoData.name ?? '???';
		this.display = dinoData.display.gfx;
		this.level = dinoData.level;
		this.maxLife = dinoData.maxLife;
		this.life = dinoData.life;
		this.isSacrificed = sacrified ?? false;
		this.experience = dinoData.xp;
		this.nbrUpAir = dinoData.elements.air;
		this.nbrUpFire = dinoData.elements.fire;
		this.nbrUpLightning = dinoData.elements.thunder;
		this.nbrUpWood = dinoData.elements.wood;
		this.nbrUpWater = dinoData.elements.water;
		this.isFrozen = dinoData.status?.id === 'congel';
	}

	get getRaceId(): number {
		const race = Object.values(raceList).find(race => race.swfLetter[0] === this.display[0]);
		if (!race) {
			return 0;
		}
		return race.raceId;
	}

	public toImportDinoz(): ImportDinoz {
		const skillList = this.skills.map(skill => skill.skillId);
		const statusList = this.status.map(stat => stat.statusId);
		return {
			skills: skillList,
			status: statusList,
			name: this.name,
			isSacrificed: this.isSacrificed,
			isFrozen: this.isFrozen,
			level: this.level,
			life: this.life,
			maxLife: this.maxLife,
			experience: this.experience,
			nbrUpFire: this.nbrUpFire,
			nbrUpAir: this.nbrUpAir,
			nbrUpLightning: this.nbrUpLightning,
			nbrUpWater: this.nbrUpWater,
			nbrUpWood: this.nbrUpWood,
			raceId: this.getRaceId
		};
	}
}
