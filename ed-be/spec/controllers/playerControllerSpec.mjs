import { HTTP_STATUS_OK, mockedReq, mockedRes, playerId } from '../utils/constants.js';
import { basicPlayer } from '../data/playerData.js';
import PlayerRepository from '../../app/repositories/player.repository.js';
import PlayerController from '../../app/controllers/player.controller.js';

let req;
let res;

describe('Test de la fonction getPlayerMoney() -', function() {

    beforeEach(function() {
        req = mockedReq;
        req.params = { id: playerId };
        res = mockedRes();

        spyOn(PlayerRepository, 'getMoney').and.returnValue(basicPlayer);
        spyOn(res, 'status').and.callThrough();
        spyOn(res, 'send').and.callThrough();
    });

    it('Cas nominal', async function() {
        await PlayerController.getPlayerMoney(req, res);

        expect(res.status).toHaveBeenCalledOnceWith(HTTP_STATUS_OK);
        
        expect(PlayerRepository.getMoney).toHaveBeenCalledTimes(1);
        expect(PlayerRepository.getMoney).toHaveBeenCalledWith(playerId);
    });
});