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
import { levelList, placeList, raceList, skillList, statusList } from '../constants/index.js';
import gameConfig from '../config/game.config.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { getAvailableActions } from '../business/dinozService.js';
import { DinozSkillFiche } from '@drpg/core/models/dinoz/DinozSkillFiche';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getRandomUpElement } from '../utils/helpers/DinozHelper.js';
import { Place } from "@drpg/core/models/place/Place";

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

	constructor(input: number | string, player?: Player, display?: string) {
		if (typeof input === 'number') {
			this.id = input;
		} else {
			const race = Object.values(raceList).find(race => race.name === input);
			if (race && player && display) {
				this.name = '?';
				this.isFrozen = false;
				this.isSacrificed = false;
				this.raceId = race.raceId;
				this.level = 1;
				this.player = player;
				this.placeId = placeList.DINOVILLE.placeId;
				this.display = display;
				this.life = 100;
				this.maxLife = 100;
				this.experience = 0;
				this.canChangeName = true;
				this.canGather = false;
				this.nbrUpFire = race.nbrFire;
				this.nbrUpWood = race.nbrWood;
				this.nbrUpWater = race.nbrWater;
				this.nbrUpLightning = race.nbrLightning;
				this.nbrUpAir = race.nbrAir;
				this.nextUpElementId = getRandomUpElement(race.upChance)!;
				this.nextUpAltElementId = getRandomUpElement(race.upChance)!;
			}
		}
	}

	get isAlive(): boolean {
		return this.life > 0;
	}

	get maxExp(): number {
		return levelList.find(levels => levels.id === this.level)!.experience;
	}

	get remainingXPToLevelUp(): number {
		return this.maxExp - this.experience;
	}

	get isMaxLevel(): boolean {
		return this.level === gameConfig.dinoz.maxLevel;
	}

	get canLevelUp(): boolean {
		return this.remainingXPToLevelUp <= 0 && !this.isMaxLevel;
	}

	get race(): DinozRace {
		return Object.values(raceList).find(race => race.raceId === this.raceId)!;
	}

  get canChangeSkillState(): boolean {
    return this.status.some(status => status.statusId === statusList.STRATEGY_IN_130_LESSONS);
  }

  get actualPlace(): Place {
    return Object.values(placeList).find(place => place.placeId === this.placeId)!;
  }

	public belongToPlayer(playerToTest: number | undefined): void {
		if (this.player.id !== playerToTest) {
			throw new ErrorFormator(500, `Dinoz ${this.id} doesn't belong to player ${playerToTest}`);
		}
	}

  public canGoThisPlace(place: Place): boolean {
    return this.status.some(status => status.id === place.conditions)
  }

  public knowSkillId(skillId: number): boolean {
    return this.skills.some(skill => skill.skillId === skillId);
  }

	public toDinozFiche(): DinozFiche {
		return {
			id: this.id,
			name: this.name,
			display: this.display,
			isFrozen: this.isFrozen,
			isSacrificed: this.isSacrificed,
			level: this.level,
			missionId: this.missions.find(mission => !mission.isFinished)?.missionId,
			canChangeName: this.canChangeName,
			following: this.following,
			life: this.life,
			maxLife: this.maxLife,
			experience: this.experience,
			maxExperience: levelList.find(level => level.id === this.level)!.experience,
			canGather: this.canGather,
			race: this.race,
			placeId: this.placeId,
			actions: getAvailableActions(this),
			items: this.items.map(item => item.itemId),
			status: this.status.map(status => status.statusId),
			borderPlace: Object.values(placeList)
				.find(place => place.placeId === this.placeId)!
				.borderPlace.map(placeId => Object.values(placeList).find(place => place.placeId === placeId))
				.filter(place => !place!.conditions || this.status.some(status => status.statusId === place!.conditions))
				.map(place => place!.placeId),
			nbrUpFire: this.nbrUpFire,
			nbrUpWood: this.nbrUpWood,
			nbrUpWater: this.nbrUpWater,
			nbrUpLightning: this.nbrUpLightning,
			nbrUpAir: this.nbrUpAir
		};
	}

	public toDinozSkillFiche(): Array<DinozSkillFiche> {
		return this.skills.map(skill => {
			const skillFound: DinozSkillFiche | undefined = Object.values(skillList).find(
				skillDinoz => skillDinoz.skillId === skill.skillId
			)!;
			return {
				skillId: skillFound.skillId,
				type: skillFound.type,
				energy: skillFound.energy,
				element: skillFound.element,
				state: skill.state,
				activatable: skillFound.activatable,
				tree: skillFound.tree,
				isBaseSkill: skillFound.isBaseSkill,
				isSphereSkill: skillFound.isSphereSkill
			};
		});
	}
}
