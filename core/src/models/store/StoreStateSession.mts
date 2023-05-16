import { DinozFiche } from "../dinoz/DinozFiche.mjs";
import { FightResult } from "../fight/FightResult.mjs";
import { PlayerOptions } from "../player/PlayerOptions.mjs";

export class StoreStateSession {
  dinozCount?: number;
  jwt?: string;
  money?: number;
  dinozList?: Array<DinozFiche>;
  playerId?: number;
  fight?: FightResult;
  tab: number;
  playerOptions: PlayerOptions;
}
