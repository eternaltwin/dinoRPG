import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { ElementType } from "@drpg/core/models/enums/ElementType";

export const FixedSkillDamage: Skill[] = [
	Skill.ECRASEMENT,
	Skill.M_BITE,
	Skill.M_ABSORPTION,
	Skill.M_COMET,
	Skill.M_VENERABLE,
	Skill.M_ELEMENTAL_DISCIPLE,
];

export const SkillAttacks: Partial<Record<Skill, Partial<Record<ElementType, number>>>> = {
	// AIR
	[Skill.AIGUILLON]: {
		[ElementType.AIR]: 3,
	},
	[Skill.RAIJIN]: {
		[ElementType.AIR]: 20,
	},
	[Skill.DJINN]: {
		[ElementType.AIR]: 20,
	},
	[Skill.TOTEM_ANCESTRAL_AEROPORTE]: {
		[ElementType.AIR]: 30,
	},
	[Skill.MISTRAL]: {
		[ElementType.AIR]: 3,
	},
	[Skill.TORNADE]: {
		[ElementType.AIR]: 10,
	},
	[Skill.DISQUE_VACUUM]: {
		[ElementType.AIR]: 12,
	},
	// FIRE
	[Skill.SOUFFLE_ARDENT]: {
		[ElementType.FIRE]: 5,
	},
	[Skill.PAUME_CHALUMEAU]: {
		[ElementType.FIRE]: 10,
	},
	[Skill.KAMIKAZE]: {
		[ElementType.FIRE]: 15,
	},
	[Skill.BOULE_DE_FEU]: {
		[ElementType.FIRE]: 7,
	},
	[Skill.COULEE_DE_LAVE]: {
		[ElementType.FIRE]: 12,
	},
	[Skill.METEORES]: {
		[ElementType.FIRE]: 10,
	},
	[Skill.BRASERO]: {
		[ElementType.FIRE]: 3,
	},
	[Skill.VULCAIN]: {
		[ElementType.FIRE]: 20,
	},
	[Skill.SALAMANDRE]: {
		[ElementType.FIRE]: 30,
	},
	[Skill.CREPUSCULE_FLAMBOYANT]: {
		[ElementType.FIRE]: 6,
		[ElementType.LIGHTNING]: 6,
	},
	// LIGHTNING
	[Skill.FOUDRE]: {
		[ElementType.LIGHTNING]: 10,
	},
	[Skill.ECLAIR_SINUEUX]: {
		[ElementType.LIGHTNING]: 10,
	},
	[Skill.DANSE_FOUDROYANTE]: {
		[ElementType.LIGHTNING]: 3,
	},
	[Skill.QUETZACOATL]: {
		[ElementType.LIGHTNING]: 40,
	},
	// WATER
	[Skill.CANON_A_EAU]: {
		[ElementType.WATER]: 6,
	},
	[Skill.GEL]: {
		[ElementType.WATER]: 5,
	},
	[Skill.DOUCHE_ECOSSAISE]: {
		[ElementType.WATER]: 2,
	},
	[Skill.RAYON_KAAR_SHER]: {
		[ElementType.WATER]: 7,
	},
	[Skill.DELUGE]: {
		[ElementType.WATER]: 10,
	},
	[Skill.LEVIATHAN]: {
		[ElementType.WATER]: 20,
	},
	[Skill.ONDINE]: {
		[ElementType.WATER]: 30,
	},
	// WOOD
	[Skill.LANCEUR_DE_GLAND]: {
		[ElementType.WOOD]: 5,
	},
	[Skill.LOUP_GAROU]: {
		[ElementType.WOOD]: 30,
	},
	[Skill.LANCER_DE_ROCHE]: {
		[ElementType.WOOD]: 10,
	},
	[Skill.SECOUSSE]: {
		[ElementType.WOOD]: 4,
		[ElementType.AIR]: 4,
	},
	[Skill.HERCOLUBUS]: {
		[ElementType.FIRE]: 10,
		[ElementType.LIGHTNING]: 10,
		[ElementType.WOOD]: 10,
		[ElementType.WATER]: 10,
		[ElementType.AIR]: 10,
	},
	[Skill.M_COMET]: {
		[ElementType.FIRE]: 20,
		[ElementType.VOID]: 30,
	},
	[Skill.M_VENERABLE]: {
		[ElementType.FIRE]: 50,
		[ElementType.AIR]: 50,
	},
	// RACE
	[Skill.CHARGE_PIGMOU]: {
		[ElementType.FIRE]: 5,
		[ElementType.WOOD]: 3,
	},
	// MONSTER
	[Skill.M_WORM_2]: {
		[ElementType.VOID]: 5,
	},
	[Skill.M_ELEMENTAL_DISCIPLE]: {
		[ElementType.AIR]: 200,
	},
};
