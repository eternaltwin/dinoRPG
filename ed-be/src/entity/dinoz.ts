import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	JoinColumn,
	OneToMany,
	ManyToOne,
	ManyToMany,
	JoinTable,
	CreateDateColumn,
	UpdateDateColumn,
	Relation
} from 'typeorm';
import { Player } from './player.js';
import { DinozItem, DinozMission, DinozSkill, DinozSkillUnlockable, DinozStatus, NPC } from './index.js';

@Entity()
export class Dinoz {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.dinoz, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	player: Relation<Player>;

	@OneToMany(() => DinozSkill, skill => skill.dinoz, {
		cascade: true
	})
	skills: Relation<DinozSkill[]>;

	@OneToMany(() => DinozSkillUnlockable, skillUnlockable => skillUnlockable.dinoz, {
		cascade: true
	})
	skillsUnlockable: Relation<DinozSkillUnlockable[]>;

	@OneToMany(() => NPC, NPC => NPC.dinoz, {
		cascade: true
	})
	NPC: Relation<NPC[]>;

	@OneToMany(() => DinozStatus, status => status.dinoz, {
		cascade: true
	})
	status: Relation<DinozStatus[]>;

	@OneToMany(() => DinozMission, mission => mission.dinoz, {
		cascade: true
	})
	missions: Relation<DinozMission[]>;

	@ManyToMany(() => DinozItem, {
		cascade: true
	})
	@JoinTable()
	items: Relation<DinozItem[]>;

	@Column({
		nullable: true
	})
	following: number;

	@Column({
		nullable: false
	})
	name: string;

	@Column({
		nullable: false,
		default: false
	})
	isFrozen: boolean;

	@Column({
		nullable: false,
		default: false
	})
	isSacrificed: boolean;

	@Column({
		nullable: false
	})
	raceId: number;

	@Column({
		nullable: false
	})
	level: number;

	@Column({
		nullable: true
	})
	missionId: number;

	@Column({
		nullable: false
	})
	nextUpElementId: number;

	@Column({
		nullable: false
	})
	nextUpAltElementId: number;

	@Column({
		nullable: false
	})
	placeId: number;

	@Column({
		nullable: false
	})
	canChangeName: boolean;

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
		nullable: false,
		default: false
	})
	canGather: boolean;

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

	@Column({
		nullable: true
	})
	order: number;

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;

	constructor(id: number) {
		this.id = id;
	}
}
