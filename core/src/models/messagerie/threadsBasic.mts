import { Player } from "@drpg/prisma";

export interface ThreadsBasic {
	id: string;
	title: string;
	createdById: number;
	createdBy: {
		name: string;
	};
	participants: {
		playerId: string;
	}[];
	updatedAt: Date;
}

export interface NewThread {
	message: string;
	title: string;
	createdBy: number;
	participants: Pick<Player, 'id' | 'name'>[];
}

export interface FullThread {
	id: string;
	messages: Message[];
	pinnedMessage: Message | undefined;
	title: string;
	createdBy: number;
	participants: { player: Pick<Player, 'id' | 'name'> }[];
}

export interface Message {
	id: number;
	content: string;
	sender: Pick<Player, 'id' | 'name'>;
	createdAt: Date;
}
