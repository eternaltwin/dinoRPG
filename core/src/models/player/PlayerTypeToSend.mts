import { Player } from "@drpg/prisma";

export interface PlayerTypeToSend extends Player {
	status: number[];
	createdDate: Date;
}
