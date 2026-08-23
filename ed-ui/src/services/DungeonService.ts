import { http } from '../utils/index.js';
import { MoveResult, MoveStep, StartRunResult } from '@drpg/core/models/dungeon/DungeonClient';

export const DungeonService = {
	async enterDungeon(id: string, dinozId: number): Promise<StartRunResult> {
		const res = await http().post(`/dungeon/${id}/enter`, { dinozId });
		return res.data;
	},
	/** Leave the dungeon from its start or exit cell: clears the dinoz's unavailableReason. */
	async exitDungeon(id: string, dinozId: number): Promise<void> {
		await http().post(`/dungeon/${id}/exit`, { dinozId });
	},
	/**
	 * A batch of steps, applied in order server-side: dx/dy for a cell move, dl (±1)
	 * to take a stair under the dinoz. The server stops at the first refused or
	 * event step and reports how many it applied.
	 */
	async moveDinoz(id: string, steps: MoveStep[], dinozId: number): Promise<MoveResult> {
		const res = await http().post(`/dungeon/${id}/move`, { steps, dinozId }, { silent: true });
		return res.data;
	}
};
