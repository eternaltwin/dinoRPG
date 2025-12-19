export class LiveStats {
	public connectedPlayers: number = 0;
	public totalPlayers: number = 0;
	public totalDinoz: number = 0;

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

	public incrementConnectedPlayers() {
		this.connectedPlayers++;
	}

	public decrementConnectedPlayers() {
		if (this.connectedPlayers > 0) {
			this.connectedPlayers--;
		}
	}

	public get summary() {
		return {
			totalDinoz: this.totalDinoz,
			totalPlayers: this.totalPlayers,
			connectedPlayers: this.connectedPlayers
		};
	}
}
