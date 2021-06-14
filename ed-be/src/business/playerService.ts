import { Request, Response } from 'express';
import { getCommonDataRequest } from '../dao/playerDao.js';
import { Player } from '../models/index.js';

const getCommonData = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const commonData: Player | null = await getCommonDataRequest(
		req.user!.playerId!
	);
	return res.status(200).send(commonData);
};

export { getCommonData };
