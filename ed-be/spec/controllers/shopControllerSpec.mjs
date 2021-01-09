import { HTTP_STATUS_OK, mockedReq, mockedRes, config } from '../utils/constants.js';
import ShopController from '../../app/controllers/shop.controller.js';
import ShopRepository from '../../app/repositories/shop.repository.js';
import PlayerRepository from '../../app/repositories/player.repository.js';
import DinozRaceRepository from '../../app/repositories/dinozRace.respository.js';
import { playerWithRewards } from '../data/playerData.js';
import { raceArray } from '../data/raceData.js';
import context from '../../app/utils/context.js';

let req;
let res;

describe('Test de la fonction getDinozFromDinozShop() -', function(){

    beforeEach(function() {
        req = mockedReq;
        res = mockedRes();

        spyOn(PlayerRepository, 'getRewardFromArray').and.returnValue(playerWithRewards);
        spyOn(DinozRaceRepository, 'getRaceFromArray').and.returnValue(raceArray);
        spyOn(ShopRepository, 'createMultiple');
        spyOn(context, 'getConfig').and.returnValue(config);
        spyOn(res, 'status').and.callThrough();
        spyOn(res, 'send').and.callThrough();
    });

    it('Creation of X dinoz', async function() {
        spyOn(ShopRepository, 'getDinozFromDinozShop').and.returnValue([]);

        await ShopController.getDinozFromDinozShop(req, res);

        expect(res.status).toHaveBeenCalledOnceWith(HTTP_STATUS_OK);
        expect(res.send).toHaveBeenCalledOnceWith([]);

        expect(ShopRepository.getDinozFromDinozShop).toHaveBeenCalledTimes(2);
        expect(PlayerRepository.getRewardFromArray).toHaveBeenCalledTimes(1);
        expect(DinozRaceRepository.getRaceFromArray).toHaveBeenCalledTimes(1);
        expect(ShopRepository.createMultiple).toHaveBeenCalledTimes(1);

        expect(ShopRepository.getDinozFromDinozShop).toHaveBeenCalledWith(req.user.playerId);
    });

    it('Dinoz already exists in dinoz shop', async function() {
        spyOn(ShopRepository, 'getDinozFromDinozShop').and.returnValue([{}]);

        await ShopController.getDinozFromDinozShop(req, res);

        expect(res.status).toHaveBeenCalledOnceWith(HTTP_STATUS_OK);
        expect(res.send).toHaveBeenCalledOnceWith([{}]);

        expect(ShopRepository.getDinozFromDinozShop).toHaveBeenCalledTimes(1);
        expect(PlayerRepository.getRewardFromArray).toHaveBeenCalledTimes(0);

        expect(ShopRepository.getDinozFromDinozShop).toHaveBeenCalledWith(req.user.playerId);
    });
});