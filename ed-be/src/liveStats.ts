export class LiveStats {
	public totalPlayers = 0;
	public totalDinoz = 0;

	constructor(initialData: Partial<LiveStats>) {
		Object.assign(this, initialData);
	}

	public incrementDinoz() {
		this.totalDinoz++;
	}

	public incrementTotalPlayers() {
		this.totalPlayers++;
	}

	public decrementTotalPlayers() {
		this.totalPlayers--;
	}

	/** The connected players count lives with the SSE channels: see countConnectedSsePlayers. */
	public summary(connectedPlayers: number) {
		return {
			totalDinoz: this.totalDinoz,
			totalPlayers: this.totalPlayers,
			connectedPlayers
		};
	}
}
