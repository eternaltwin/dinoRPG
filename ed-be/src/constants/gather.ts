import { GatherData } from '@drpg/core/models/gather/gatherData';
import { ConditionEnum, ConditionOperatorEnum } from '@drpg/core/models/enums/Parser';
import { ingredientList } from './ingredient.js';
import { skillList } from './skill.js';
import { placeList } from './place.js';
import { GatherType } from '@drpg/core/models/enums/GatherType';

export const gather: Record<string, GatherData> = {
	FISH: {
		action: 'fish',
		type: GatherType.FISH,
		size: 7,
		clicks: 2,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.APPRENTI_PECHEUR.skillId
		},
		apparence: 'FISH',
		items: [
			{
				ingredientId: ingredientList.MEROU_LUJIDANE.ingredientId,
				count: 18
			},
			{
				ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
				count: 5,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.PECHEUR_CONFIRME.skillId
				}
			},
			{
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				count: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.MAITRE_PECHEUR.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.PORT_DE_PRECHE.name
					}
				}
			},
			{
				ingredientId: ingredientList.GLOBULOS.ingredientId, //4
				count: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.MAITRE_PECHEUR.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.CHUTES_MUTANTES.name
					}
				}
			},
			{
				ingredientId: ingredientList.SUPER_POISSON.ingredientId, //5
				count: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.MAITRE_PECHEUR.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.FLEUVE_JUMIN.name
					}
				}
			}
		]
	}
};
