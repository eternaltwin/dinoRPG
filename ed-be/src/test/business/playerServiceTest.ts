import { Request, Response } from 'express';
import { BasicPlayer } from '../data/playerData.js';
import { player } from '../utils/constants.js';
import { getCommonData } from '../../business/playerService.js';

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');

let req = {
	user: {
		playerId: player.id_1
	}
} as Request;
let res = ({
	status: jest.fn().mockReturnThis(),
	send: jest.fn().mockReturnThis()
} as unknown) as Response;

describe('Test de la fonction getCommonData()', function () {
	beforeEach(function () {
		spyOn(PlayerDao, 'getCommonDataRequest').and.returnValue(BasicPlayer);
		spyOn(DinozDao, 'getDinozTotalCount').and.returnValue(0);

		BasicPlayer.setDataValue = jest.fn().mockResolvedValue([]);
	});

	it('Cas nominal', async function () {
		await getCommonData(req, res);

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozTotalCount).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledWith(
			req.user!.playerId
		);
	});
});
