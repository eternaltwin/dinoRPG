import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	Relation,
	UpdateDateColumn
} from 'typeorm';
import { Player } from './player.js';
import { Concentration, DinozItem, DinozMission, DinozSkill, DinozSkillUnlockable, DinozStatus, NPC } from './index.js';
import { levelList, skillList } from '../constants/index.js';
import gameConfig from '../config/game.config.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { DinozSkillFiche } from '@drpg/core/models/dinoz/DinozSkillFiche';
import { getRandomUpElement } from '../utils/helpers/DinozHelper.js';
import { Place } from '@drpg/core/models/place/Place';
import { GatherData } from '@drpg/core/models/gather/gatherData';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { ErrorFormator } from '../utils/errorFormator.js';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { Condition } from '@drpg/core/models/npc/NpcConditions';
import { checkCondition } from '../utils/checkConditions.js';
import { DinozFicheLite } from '@drpg/core/models/dinoz/DinozFicheLite';
import { ImportDinoz } from '@drpg/core/models/import/importDinoz';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { statusList } from '@drpg/core/models/dinoz/StatusList';
import { raceList } from '@drpg/core/models/dinoz/RaceList';

@Entity()
export class Dinoz {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Player, player => player.dinoz, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	player: Relation<Player>;

	@ManyToOne(() => Concentration, concentration => concentration.dinoz, {
		onDelete: 'SET NULL'
	})
	@JoinColumn()
	concentration: Relation<Concentration>;

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

	@OneToMany(() => DinozItem, item => item.dinoz, {
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

	constructor(input: number | string, player?: Player, display?: string, importData?: ImportDinoz) {
		if (typeof input === 'number') {
			this.id = input;
		} else if (input === 'import' && importData && player && display) {
			let race = Object.values(raceList).find(race => race.raceId === importData.raceId);
			if (!race) {
				race = raceList.MOUEFFE;
			}
			this.player = player;
			this.display = display;
			this.name = importData.name;
			this.isFrozen = importData.isFrozen;
			this.level = importData.level;
			this.placeId = placeList.DINOVILLE.placeId;
			this.life = importData.life;
			this.maxLife = importData.maxLife;
			this.experience = importData.experience;
			this.canChangeName = importData.name === '???';
			this.nbrUpFire = importData.nbrUpFire;
			this.nbrUpWood = importData.nbrUpWood;
			this.nbrUpWater = importData.nbrUpWater;
			this.nbrUpLightning = importData.nbrUpLightning;
			this.nbrUpAir = importData.nbrUpAir;
			this.raceId = race.raceId;
			this.nextUpElementId = getRandomUpElement(race.upChance)!;
			this.nextUpAltElementId = getRandomUpElement(race.upChance)!;
			this.skills = importData.skills.map(s => {
				return new DinozSkill(this, s);
			});
			this.status = importData.status.map(s => {
				return new DinozStatus(this, s);
			});
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

	get useRice(): Partial<Dinoz> {
		return {
			id: this.id,
			name: '?',
			experience: 0,
			canChangeName: true
		};
	}

	get backpackSlot(): number {
		let total = 2;
		if (this.skills.find(skill => skill.skillId === skillList.POCHE_VENTRALE.skillId)) total++;
		if (this.skills.find(skill => skill.skillId === skillList.SURPLIS_DHADES.skillId)) total++;
		if (this.status.find(status => status.statusId === statusList.BACKPACK)) total++;
		if (this.player.engineer) total++;
		return total;
	}

	public numberOfGatheringClick(gridInformation: GatherData): number {
		let click = 0;
		switch (gridInformation.type) {
			case GatherType.FISH:
				this.skills.some(s => s.skillId === skillList.NEMO.skillId) ? click++ : click;
				break;
			case GatherType.CUEILLE1:
			case GatherType.CUEILLE2:
			case GatherType.CUEILLE3:
			case GatherType.CUEILLE4:
				this.skills.some(s => s.skillId === skillList.LONDUHAUT.skillId) ? click++ : click;
				break;
			case GatherType.ENERGY1:
			case GatherType.ENERGY2:
				this.skills.some(s => s.skillId === skillList.EINSTEIN.skillId) ? click++ : click;
				break;
			case GatherType.HUNT:
				this.skills.some(s => s.skillId === skillList.BENEDICTION_DARTEMIS.skillId) ? click++ : click;
				break;
			case GatherType.SEEK:
				this.skills.some(s => s.skillId === skillList.EXPERT_EN_FOUILLE.skillId) ? click++ : click;
				this.skills.some(s => s.skillId === skillList.PLANIFICATEUR.skillId) ? click++ : click;
				this.skills.some(s => s.skillId === skillList.CHAMPOLLION.skillId) ? click++ : click;
				this.skills.some(s => s.skillId === skillList.GRATTEUR.skillId) ? click++ : click;
				break;
			case GatherType.LABO:
			case GatherType.PARTY:
			case GatherType.XMAS:
			case GatherType.TICTAC:
			case GatherType.ANNIV:
				break;
		}
		return gridInformation.minimumClick + click;
	}

	public canGoThisPlace(condition: Condition): boolean {
		return checkCondition(condition, this);
	}

	public possessStatus(statusId: number): boolean {
		return this.status.some(status => status.statusId === statusId);
	}

	public knowSkillId(skillId: number): boolean {
		return this.skills.some(skill => skill.skillId === skillId);
	}

	public heal(lifeToAdd: number): Partial<Dinoz> {
		const lifeHealed = this.maxLife - this.life > lifeToAdd ? lifeToAdd : this.maxLife - this.life;
		if (lifeHealed === 0) throw new ErrorFormator(400, 'AlreadyAtMaxHealth');
		if (this.life === 0) throw new ErrorFormator(400, 'DinozIsDead');
		this.life += lifeHealed;
		return {
			id: this.id,
			life: this.life
		};
	}

	public resurrect(): Partial<Dinoz> {
		if (this.life > 0) {
			throw new ErrorFormator(400, 'DinozNotDead');
		}
		this.life = 1;
		return {
			id: this.id,
			life: this.life
		};
	}

	public learnNextSphereSkill(element: ElementType): number {
		const sphereSkills = Object.values(skillList)
			.filter(skill => skill.isSphereSkill)
			.filter(skill => skill.element.some(el => el === element))
			.sort((a, b) => a.skillId - b.skillId);
		//Search last sphere skills from this element learnt
		const lastKnownSphere = this.skills
			.filter(skill => sphereSkills.some(s => skill.skillId === s.skillId))
			.map(skill => skill.skillId)
			.sort()
			.pop();

		if (!lastKnownSphere) {
			return sphereSkills[0].skillId;
		}

		let testSphereToLean = sphereSkills.find(skill => skill.unlockedFrom?.some(s => s === lastKnownSphere));
		if (!testSphereToLean) {
			throw new ErrorFormator(400, `AlreadySphere`);
		}

		return testSphereToLean.skillId;
	}

	public toDinozFiche(): DinozFiche {
		return {
			id: this.id,
			name: this.name,
			display: this.display,
			isFrozen: this.isFrozen,
			isSacrificed: this.isSacrificed,
			level: this.level,
			missionId: this.missions?.find(mission => !mission.isFinished)?.missionId,
			canChangeName: this.canChangeName,
			following: this.following,
			life: this.life,
			maxLife: this.maxLife,
			experience: this.experience,
			maxExperience: levelList.find(level => level.id === this.level)!.experience,
			race: Object.values(raceList).find(race => race.raceId === this.raceId)!,
			placeId: this.placeId,
			items: this.items?.map(item => item.itemId),
			maxItems: this.backpackSlot,
			status: this.status?.map(status => status.statusId).sort((a, b) => a - b),
			borderPlace: Object.values(placeList)
				.find(place => place.placeId === this.placeId)!
				.borderPlace.map(placeId => Object.values(placeList).find(place => place.placeId === placeId))
				.filter(place => !place!.conditions || this.canGoThisPlace(place!.conditions))
				.map(place => place!.placeId),
			nbrUpFire: this.nbrUpFire,
			nbrUpWood: this.nbrUpWood,
			nbrUpWater: this.nbrUpWater,
			nbrUpLightning: this.nbrUpLightning,
			nbrUpAir: this.nbrUpAir
		};
	}

	public toDinozFicheLite(): DinozFicheLite {
		return {
			id: this.id,
			name: this.name,
			display: this.display,
			following: this.following,
			life: this.life,
			maxLife: this.maxLife,
			experience: this.experience,
			maxExperience: levelList.find(level => level.id === this.level)!.experience,
			placeId: this.placeId,
			order: this.order,
			isFrozen: this.isFrozen
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
