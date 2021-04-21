import { Request, Response } from 'express';
import { BasicPlayer } from '../data/playerData';
import { player } from '../utils/constants';
import { getCommonData } from '../../business/playerService';

const PlayerDao = require('../../dao/playerDao');

let req = {
	user: {
		playerId: player.id_1,
	},
} as Request;
let res = ({
	status: jest.fn().mockReturnThis(),
	send: jest.fn().mockReturnThis(),
} as unknown) as Response;

describe('Test de la fonction getCommonData()', function () {
	beforeEach(function () {
		spyOn(PlayerDao, 'getCommonDataRequest').and.returnValue(BasicPlayer);
	});

	it('Cas nominal', async function () {
		await getCommonData(req, res);

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledWith(
			req.user!.playerId
		);
	});
});
