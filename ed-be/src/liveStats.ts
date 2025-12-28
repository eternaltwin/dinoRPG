export class LiveStats {
	public connectedPlayers = new Set();
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

	public addConnectedPlayers(playerId: string) {
		this.connectedPlayers.add(playerId);
	}

	public removeConnectedPlayers(playerId: string) {
		this.connectedPlayers.delete(playerId);
	}

	public summary() {
		return {
			totalDinoz: this.totalDinoz,
			totalPlayers: this.totalPlayers,
			connectedPlayers: this.connectedPlayers.size
		};
	}
}
