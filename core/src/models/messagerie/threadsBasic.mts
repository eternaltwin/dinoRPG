import { Player } from '../player/Player.mjs';

export interface ThreadsBasic {
	id: string;
	title: string;
	createdBy: number;
	participants: {
		playerId: number;
	}[];
	lastMessage: Date;
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
	participants: Pick<Player, 'id' | 'name'>[];
}

export interface Message {
	id: number;
	content: string;
	sender: Pick<Player, 'id' | 'name'>;
	createdAt: Date;
}
