export interface CreatePollOption {
	optionText: string;
	orderIndex?: number;
}

export interface CreatePollData {
	newsId: number;
	options: CreatePollOption[];
	isActive?: boolean;
}

export interface PollPublic {
	id: number;
	isActive: boolean;
	createdDate: Date;
	options: {
		id: number;
		optionText: string;
	}[];
	votes: { playerId: string; pollOptionId: number }[];
}

export interface CreatePollResult {
	success: boolean;
	poll?: PollPublic;
	error?: string;
}
