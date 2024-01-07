import { Skill } from "@drpg/core/models/dinoz/SkillList";
import { AssaultElement } from "@drpg/core/utils/getAssaultStat";

export const SkillAttacks: Partial<Record<Skill, { power: number, element: AssaultElement }>> = {
	// FIRE
	[Skill.SOUFFLE_ARDENT]: {
		power: 5,
		element: AssaultElement.FIRE,
	},
	[Skill.PAUME_CHALUMEAU]: {
		power: 10,
		element: AssaultElement.FIRE,
	},
	[Skill.KAMIKAZE]: {
		power: 15,
		element: AssaultElement.FIRE,
	},
	[Skill.BOULE_DE_FEU]: {
		power: 7,
		element: AssaultElement.FIRE,
	},
	[Skill.COULEE_DE_LAVE]: {
		power: 12,
		element: AssaultElement.FIRE,
	},
	[Skill.METEORES]: {
		power: 10,
		element: AssaultElement.FIRE,
	},
	[Skill.BRASERO]: {
		power: 3,
		element: AssaultElement.FIRE,
	},
	// WATER
	[Skill.CANON_A_EAU]: {
		power: 6,
		element: AssaultElement.WATER,
	},
	[Skill.GEL]: {
		power: 5,
		element: AssaultElement.WATER,
	},
	[Skill.DOUCHE_ECOSSAISE]: {
		power: 2,
		element: AssaultElement.WATER,
	},
	[Skill.RAYON_KAAR_SHER]: {
		power: 7,
		element: AssaultElement.WATER,
	},
	[Skill.DELUGE]: {
		power: 10,
		element: AssaultElement.WATER,
	},
	// WOOD
	[Skill.LANCEUR_DE_GLAND]: {
		power: 5,
		element: AssaultElement.WOOD,
	}
};