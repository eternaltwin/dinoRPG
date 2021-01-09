import DinozController from '../../app/controllers/dinoz.controller.js';
import DinozRepository from '../../app/repositories/dinoz.repository.js';
import PlayerRepository from '../../app/repositories/player.repository.js';
import ShopRepository from '../../app/repositories/shop.repository.js';
import { basicDinoz, basicDinoz2 } from '../data/dinozData.js';
import { basicPlayer, basicPlayer2 } from '../data/playerData.js';
import { HTTP_STATUS_OK, SERVER_ERROR, dinozId, HTTP_STATUS_UNAUTHORIZED, mockedReq, mockedRes, playerId, playerId2 } from '../utils/constants.js';

let req;
let res;

describe('Test de la fonction getDinozFiche() -', function() {

    beforeEach(function() {
        req = mockedReq;
        req.params = basicDinoz;
        res = mockedRes();

        spyOn(DinozRepository, 'getDinozFiche').and.returnValue(basicDinoz);
        spyOn(res, 'status').and.callThrough();
        spyOn(res, 'send').and.callThrough();
    });

    it('Cas nominal', async function() {
        spyOn(DinozRepository, 'getPlayerFromDinozId').and.returnValue(basicPlayer);
        
        await DinozController.getDinozFiche(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_OK);
        expect(res.send).toHaveBeenCalledWith(basicDinoz);

        expect(DinozRepository.getPlayerFromDinozId).toHaveBeenCalledTimes(1);
        expect(DinozRepository.getDinozFiche).toHaveBeenCalledTimes(1);

        expect(DinozRepository.getPlayerFromDinozId).toHaveBeenCalledWith(dinozId);
        expect(DinozRepository.getDinozFiche).toHaveBeenCalledWith(dinozId);
    });

    it('Cas unauthorized action', async function() {
        spyOn(DinozRepository, 'getPlayerFromDinozId').and.returnValue(basicPlayer2);

        await DinozController.getDinozFiche(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_UNAUTHORIZED);
        
        expect(DinozRepository.getPlayerFromDinozId).toHaveBeenCalledTimes(1);
        expect(DinozRepository.getDinozFiche).toHaveBeenCalledTimes(0);

        expect(DinozRepository.getPlayerFromDinozId).toHaveBeenCalledWith(dinozId);
    });
});

describe('Test de la fonction getDinozPlayer() -', function() {

    beforeEach(function() {
        req = mockedReq;
        res = mockedRes();

        spyOn(res, 'status').and.callThrough();
        spyOn(res, 'send').and.callThrough();
    });

    it('Cas nominal', async function() {
        spyOn(DinozRepository, 'getDinozPlayer').and.returnValue(basicDinoz);

        await DinozController.getDinozPlayer(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_OK);
        expect(res.send).toHaveBeenCalledWith(basicDinoz);

        expect(DinozRepository.getDinozPlayer).toHaveBeenCalledTimes(1);
        expect(DinozRepository.getDinozPlayer).toHaveBeenCalledWith(playerId);
    });

    it('Cas exception', async function() { 
        spyOn(DinozRepository, 'getDinozPlayer').and.throwError('Cannot get dinoz');

        await DinozController.getDinozPlayer(req, res);

        expect(res.status).toHaveBeenCalledWith(SERVER_ERROR);

        expect(DinozRepository.getDinozPlayer).toHaveBeenCalledTimes(1);
        expect(DinozRepository.getDinozPlayer).toHaveBeenCalledWith(playerId);
    });
});

describe('Test de la fonction buyDinoz() -', function() {

    beforeEach(function() {
        req = mockedReq;
        req.body = { 
            dinozId: dinozId
        }
        res = mockedRes();

        spyOn(PlayerRepository, 'setPlayerMoney');
        spyOn(ShopRepository, 'deleteDinozInShop').and.callThrough();
        spyOn(DinozRepository, 'create').and.returnValue(basicDinoz2);
        spyOn(res, 'status').and.callThrough();
        spyOn(res, 'send').and.callThrough();
    });

    it('Cas nominal', async function() {
        spyOn(ShopRepository, 'getDinozDetails').and.returnValue(basicDinoz);
        spyOn(PlayerRepository, 'getMoney').and.returnValue(basicPlayer);

        await DinozController.buyDinoz(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_OK);
        expect(res.send).toHaveBeenCalledWith(basicDinoz2.dinozId);

        expect(PlayerRepository.getMoney).toHaveBeenCalledTimes(1);
        expect(ShopRepository.getDinozDetails).toHaveBeenCalledTimes(1);
        expect(PlayerRepository.setPlayerMoney).toHaveBeenCalledTimes(1);
        expect(ShopRepository.deleteDinozInShop).toHaveBeenCalledTimes(1);
        expect(DinozRepository.create).toHaveBeenCalledTimes(1);

        expect(PlayerRepository.getMoney).toHaveBeenCalledWith(parseInt(playerId));
        expect(ShopRepository.getDinozDetails).toHaveBeenCalledWith(dinozId);
        expect(PlayerRepository.setPlayerMoney).toHaveBeenCalledWith(basicPlayer);
        expect(ShopRepository.deleteDinozInShop).toHaveBeenCalledWith(req.user.playerId);
    });

    it('Cas unauthorized action', async function() {
        const localBasicDinoz = JSON.parse(JSON.stringify(basicDinoz));
        localBasicDinoz.player.playerId = playerId2;

        spyOn(ShopRepository, 'getDinozDetails').and.returnValue(localBasicDinoz);
        spyOn(PlayerRepository, 'getMoney').and.returnValue(basicPlayer);

        await DinozController.buyDinoz(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_UNAUTHORIZED);

        expect(PlayerRepository.getMoney).toHaveBeenCalledTimes(1);
        expect(ShopRepository.getDinozDetails).toHaveBeenCalledTimes(1);
        expect(PlayerRepository.setPlayerMoney).toHaveBeenCalledTimes(0);

        expect(PlayerRepository.getMoney).toHaveBeenCalledWith(parseInt(req.user.playerId));
        expect(ShopRepository.getDinozDetails).toHaveBeenCalledWith(req.body.dinozId);
    });

    it('Player doesn\'t have enough money to buy a dinoz', async function() {
        const localBasicPlayer = JSON.parse(JSON.stringify(basicPlayer));
        localBasicPlayer.money = 0;
        spyOn(ShopRepository, 'getDinozDetails').and.returnValue(basicDinoz);
        spyOn(PlayerRepository, 'getMoney').and.returnValue(localBasicPlayer);

        await DinozController.buyDinoz(req, res);

        expect(res.status).toHaveBeenCalledWith(SERVER_ERROR);

        expect(PlayerRepository.getMoney).toHaveBeenCalledTimes(1);
        expect(ShopRepository.getDinozDetails).toHaveBeenCalledTimes(1);
        expect(PlayerRepository.setPlayerMoney).toHaveBeenCalledTimes(0);
    });
});

describe('Test de la fonction setDinozName() -', function() {

    beforeEach(function() {
        req = mockedReq;
        req.body = { dinoz: { dinozId: dinozId } }
        res = mockedRes();

        spyOn(res, 'status').and.callThrough();
        spyOn(res, 'send').and.callThrough();
    });

    it('Cas nominal', async function() {
        spyOn(DinozRepository, 'getPlayerFromDinozId').and.returnValue(basicPlayer);
        spyOn(DinozRepository, 'setDinozName');

        await DinozController.setDinozName(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_OK);

        expect(DinozRepository.getPlayerFromDinozId).toHaveBeenCalledTimes(1);
        expect(DinozRepository.setDinozName).toHaveBeenCalledTimes(1);

        expect(DinozRepository.getPlayerFromDinozId).toHaveBeenCalledWith(dinozId);
    });

    it('Unauthorized action', async function() {
        spyOn(DinozRepository, 'getPlayerFromDinozId').and.returnValue(basicPlayer2);
        spyOn(DinozRepository, 'setDinozName');

        await DinozController.setDinozName(req, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_UNAUTHORIZED);

        expect(DinozRepository.getPlayerFromDinozId).toHaveBeenCalledTimes(1);
        expect(DinozRepository.setDinozName).toHaveBeenCalledTimes(0);

        expect(DinozRepository.getPlayerFromDinozId).toHaveBeenCalledWith(dinozId);
    });

    it('Error occured while setting dinoz name', async function() {
        spyOn(DinozRepository, 'getPlayerFromDinozId').and.returnValue(basicPlayer);
        spyOn(DinozRepository, 'setDinozName').and.throwError('An error occured');

        await DinozController.setDinozName(req, res);

        expect(res.status).toHaveBeenCalledWith(SERVER_ERROR);
    });
});
