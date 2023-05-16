import { DinozFiche } from "../dinoz/DinozFiche.mjs";
import { PlayerOptions } from "./PlayerOptions.mjs";

export class PlayerCommonData {
	money: number;
	dinoz: Array<DinozFiche>;
	dinozCount: number;
	id: number;
	playerOptions: PlayerOptions;
}
