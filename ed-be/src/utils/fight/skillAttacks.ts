import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { ElementType } from "@drpg/core/models/enums/ElementType";

export const SkillAttacks: Partial<Record<Skill, { power: number, element: ElementType }>> = {
	// AIR
	[Skill.TOTEM_ANCESTRAL_AEROPORTE]: {
		power: 30,
		element: ElementType.AIR,
	},
	// FIRE
	[Skill.SOUFFLE_ARDENT]: {
		power: 5,
		element: ElementType.FIRE,
	},
	[Skill.PAUME_CHALUMEAU]: {
		power: 10,
		element: ElementType.FIRE,
	},
	[Skill.KAMIKAZE]: {
		power: 15,
		element: ElementType.FIRE,
	},
	[Skill.BOULE_DE_FEU]: {
		power: 7,
		element: ElementType.FIRE,
	},
	[Skill.COULEE_DE_LAVE]: {
		power: 12,
		element: ElementType.FIRE,
	},
	[Skill.METEORES]: {
		power: 10,
		element: ElementType.FIRE,
	},
	[Skill.BRASERO]: {
		power: 3,
		element: ElementType.FIRE,
	},
	// LIGHTNING
	[Skill.FOUDRE]: {
		power: 10,
		element: ElementType.LIGHTNING,
	},
	[Skill.ECLAIR_SINUEUX]: {
		power: 10,
		element: ElementType.LIGHTNING,
	},
	[Skill.DANSE_FOUDROYANTE]: {
		power: 3,
		element: ElementType.LIGHTNING,
	},
	[Skill.QUETZACOATL]: {
		power: 40,
		element: ElementType.LIGHTNING,
	},
	// WATER
	[Skill.CANON_A_EAU]: {
		power: 6,
		element: ElementType.WATER,
	},
	[Skill.GEL]: {
		power: 5,
		element: ElementType.WATER,
	},
	[Skill.DOUCHE_ECOSSAISE]: {
		power: 2,
		element: ElementType.WATER,
	},
	[Skill.RAYON_KAAR_SHER]: {
		power: 7,
		element: ElementType.WATER,
	},
	[Skill.DELUGE]: {
		power: 10,
		element: ElementType.WATER,
	},
	// WOOD
	[Skill.LANCEUR_DE_GLAND]: {
		power: 5,
		element: ElementType.WOOD,
	},
	[Skill.LANCER_DE_ROCHE]: {
		power: 10,
		element: ElementType.WOOD,
	}
};
