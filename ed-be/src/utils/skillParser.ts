import { SkillDetails, PassiveEffects, EffectDescriptor } from '@drpg/core/models/dinoz/SkillDetails';
import { Stat } from '@drpg/core/models/enums/SkillStat';
import { Dinoz, GameDinozUsage, Player } from '@drpg/prisma';
import { Skill, uSkillsToPlayerFieldMap } from '@drpg/core/models/dinoz/SkillList';
import { MathOperator } from '@drpg/core/models/enums/Parser';
import { operatorProcess } from '@drpg/core/utils/helper';

function applySkillToDinoz(
	effects: PassiveEffects,
	dinoz: Pick<Dinoz, 'id' | 'maxLife' | 'nbrUpFire' | 'nbrUpAir' | 'nbrUpLightning' | 'nbrUpWater' | 'nbrUpWood'>,
	event?: GameDinozUsage
) {
	for (const [stat, value] of Object.entries(effects)) {
		switch (stat) {
			case Stat.MAX_HP:
				dinoz.maxLife = operatorProcess(dinoz.maxLife, value as EffectDescriptor);
				break;
			case Stat.FIRE_ELEMENT:
				dinoz.nbrUpFire = operatorProcess(dinoz.nbrUpFire, value as EffectDescriptor);
				break;
			case Stat.WATER_ELEMENT:
				dinoz.nbrUpWater = operatorProcess(dinoz.nbrUpWater, value as EffectDescriptor);
				break;
			case Stat.WOOD_ELEMENT:
				dinoz.nbrUpWood = operatorProcess(dinoz.nbrUpWood, value as EffectDescriptor);
				break;
			case Stat.AIR_ELEMENT:
				dinoz.nbrUpAir = operatorProcess(dinoz.nbrUpAir, value as EffectDescriptor);
				break;
			case Stat.LIGHTNING_ELEMENT:
				dinoz.nbrUpLightning = operatorProcess(dinoz.nbrUpLightning, value as EffectDescriptor);
				break;
			default:
				break;
		}
	}
	return {
		maxLife: dinoz.maxLife,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir
	};
}

function deApplySkillFromDinoz(
	effects: PassiveEffects,
	dinoz: Pick<Dinoz, 'maxLife' | 'nbrUpFire' | 'nbrUpAir' | 'nbrUpLightning' | 'nbrUpWater' | 'nbrUpWood'>
) {
	for (const [stat, value] of Object.entries(effects)) {
		switch (stat) {
			case Stat.MAX_HP:
				dinoz.maxLife -= +value;
				break;
			case Stat.FIRE_ELEMENT:
				dinoz.nbrUpFire -= +value;
				break;
			case Stat.WATER_ELEMENT:
				dinoz.nbrUpWater -= +value;
				break;
			case Stat.WOOD_ELEMENT:
				dinoz.nbrUpWood -= +value;
				break;
			case Stat.AIR_ELEMENT:
				dinoz.nbrUpAir -= +value;
				break;
			case Stat.LIGHTNING_ELEMENT:
				dinoz.nbrUpLightning -= +value;
				break;
			default:
				break;
		}
	}

	return {
		maxLife: dinoz.maxLife,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir
	};
}

function applyUSkillEffect(
	player: Pick<
		Player,
		'leader' | 'engineer' | 'shopKeeper' | 'cooker' | 'merchant' | 'priest' | 'teacher' | 'messie' | 'matelasseur'
	>,
	skill: SkillDetails
) {
	switch (skill.id) {
		case Skill.LEADER:
			if (!player.leader) player.leader = true;
			break;
		case Skill.INGENIEUR:
			if (!player.engineer) player.engineer = true;
			break;
		case Skill.MAGASINIER:
			if (!player.shopKeeper) player.shopKeeper = true;
			break;
		case Skill.CUISINIER:
			if (!player.cooker) player.cooker = true;
			break;
		case Skill.MARCHAND:
			if (!player.merchant) player.merchant = true;
			break;
		case Skill.PRETRE:
			if (!player.priest) player.priest = true;
			break;
		case Skill.PROFESSEUR:
			if (!player.teacher) player.teacher = true;
			break;
		case Skill.MESSIE:
			if (!player.messie) player.messie = true;
			break;
		case Skill.MATELASSEUR:
			if (!player.matelasseur) player.matelasseur = true;
			break;
		default:
			break;
	}
}

/**
 * Set player U skills based on given skills
 *
 * @param player the player to update
 * @param skills the skills to compute U skills
 */
function computeUSkillEffects(
	player: Pick<
		Player,
		'leader' | 'engineer' | 'shopKeeper' | 'cooker' | 'merchant' | 'priest' | 'teacher' | 'messie' | 'matelasseur'
	>,
	skills: Skill[]
) {
	uSkillsToPlayerFieldMap.forEach((field, skill) => {
		player[field] = Boolean(skills.find(s => s === skill));
	});
}

export { applyUSkillEffect, applySkillToDinoz, computeUSkillEffects, deApplySkillFromDinoz };
