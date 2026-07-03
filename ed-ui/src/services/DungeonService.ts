import { http } from '../utils/index.js';
import { MoveResult, StartRunResult } from '@drpg/core/models/dungeon/DungeonClient';

export const DungeonService = {
	async enterDungeon(id: string, dinozId: number): Promise<StartRunResult> {
		const res = await http().post(`/dungeon/${id}/enter`, { dinozId });
		return res.data;
	},
	/** One step: dx/dy for a cell move, dl (±1) to take a stair under the dinoz. */
	async moveDinoz(id: string, dx: number, dy: number, dl = 0): Promise<MoveResult> {
		const res = await http().post(`/dungeon/${id}/move`, { dx, dy, dl }, { silent: true });
		return res.data;
	}
};
