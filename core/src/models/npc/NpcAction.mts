import { TriggerEnum } from '../enums/Parser.mjs';
import { MonsterFiche } from '../fight/MonsterFiche.mjs';

export type NpcAction = {
	actionType: TriggerEnum.FIGHT;
	enemies: Array<MonsterFiche>;
};
