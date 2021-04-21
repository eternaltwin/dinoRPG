"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dinozService_1 = require("../../business/dinozService");
const constants_1 = require("../utils/constants");
const dinozData_1 = require("../data/dinozData");
const dinozShopData_1 = require("../data/dinozShopData");
const models_1 = require("../../models");
const DinozDao = require('../../dao/dinozDao');
const DinozShopDao = require('../../dao/shopDao');
const PlayerDao = require('../../dao/playerDao');
let req = {
    user: {
        playerId: constants_1.player.id_1,
    },
};
let res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
};
describe('Test de la fonction getDinozFiche()', function () {
    beforeEach(function () {
        req.params = {
            id: constants_1.dinozId,
        };
        spyOn(DinozDao, 'getDinozFicheRequest').and.returnValue(dinozData_1.BasicDinoz);
    });
    it('Cas nominal', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield dinozService_1.getDinozFiche(req, res);
            expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
            expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(parseInt(constants_1.dinozId));
        });
    });
    it('Cas unauthorized action', function () {
        return __awaiter(this, void 0, void 0, function* () {
            dinozData_1.BasicDinoz.player.playerId = BigInt(constants_1.player.id_2);
            yield dinozService_1.getDinozFiche(req, res);
            expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
        });
    });
});
describe('Test de la fonction buyDinoz()', function () {
    let dinozCreated;
    beforeEach(function () {
        req.params = {
            id: constants_1.dinozId,
        };
        dinozCreated = {
            dinozId: 100,
            display: dinozShopData_1.DinozFromShop.display,
            experience: 0,
            following: NaN,
            life: 100,
            name: '?',
            place: { name: 'dinoville' },
        };
        spyOn(PlayerDao, 'setPlayerMoneyRequest');
        spyOn(DinozShopDao, 'deleteDinozInShopRequest');
        spyOn(DinozDao, 'createDinozRequest').and.returnValue(dinozCreated);
        const dinozBuilt = {
            get: jest.fn().mockResolvedValue(dinozShopData_1.DinozFromShop),
            create: jest.fn(),
        };
        spyOn(models_1.Dinoz, 'build').and.returnValue(dinozBuilt);
        spyOn(models_1.Dinoz, 'create').and.returnValue(dinozBuilt);
    });
    it('Cas nominal', function () {
        return __awaiter(this, void 0, void 0, function* () {
            spyOn(DinozShopDao, 'getDinozDetailsRequest').and.returnValue(dinozShopData_1.DinozFromShop);
            yield dinozService_1.buyDinoz(req, res);
            expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
            expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
            expect(DinozShopDao.deleteDinozInShopRequest).toHaveBeenCalledTimes(1);
            expect(DinozDao.createDinozRequest).toHaveBeenCalledTimes(1);
            expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(parseInt(req.params.id));
            expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(req.user.playerId, parseInt(dinozShopData_1.DinozFromShop.player.money.toString()) - dinozShopData_1.DinozFromShop.race.price);
            expect(DinozShopDao.deleteDinozInShopRequest).toHaveBeenCalledWith(req.user.playerId);
            expect(DinozDao.createDinozRequest).toHaveBeenCalledWith(Promise.resolve(dinozShopData_1.DinozFromShop));
        });
    });
    it('Dinoz found in database is null', function () {
        return __awaiter(this, void 0, void 0, function* () {
            spyOn(DinozShopDao, 'getDinozDetailsRequest').and.returnValue(null);
            yield dinozService_1.buyDinoz(req, res);
            expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
            expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
            expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(parseInt(req.params.id));
        });
    });
    it("Player doesn't have enough money to buy the dinoz", function () {
        return __awaiter(this, void 0, void 0, function* () {
            dinozShopData_1.DinozFromShop.player.money = BigInt(0);
            spyOn(DinozShopDao, 'getDinozDetailsRequest').and.returnValue(dinozShopData_1.DinozFromShop);
            yield dinozService_1.buyDinoz(req, res);
            expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
            expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
            expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(parseInt(req.params.id));
        });
    });
    it("Dinoz doesn't belong to player who made the request", function () {
        return __awaiter(this, void 0, void 0, function* () {
            dinozShopData_1.DinozFromShop.player.money = BigInt(200000);
            dinozShopData_1.DinozFromShop.player.playerId = BigInt(constants_1.player.id_2);
            spyOn(DinozShopDao, 'getDinozDetailsRequest').and.returnValue(dinozShopData_1.DinozFromShop);
            yield dinozService_1.buyDinoz(req, res);
            expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
            expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
            expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(parseInt(req.params.id));
        });
    });
});
describe('Test de la fonction setDinozName()', function () {
    let dinozToUpdate;
    beforeEach(function () {
        req.body = {
            newName: 'Potato',
        };
        dinozToUpdate = {
            canChangeName: true,
            player: {
                playerId: BigInt(constants_1.player.id_1),
            },
        };
        spyOn(models_1.Dinoz, 'build').and.returnValue(dinozToUpdate);
        spyOn(DinozDao, 'getCanDinozChangeName').and.returnValue(dinozToUpdate);
        spyOn(DinozDao, 'setDinozNameRequest');
    });
    it('Cas nominal', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield dinozService_1.setDinozName(req, res);
            expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
            expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(1);
            expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(parseInt(req.params.id));
            expect(DinozDao.setDinozNameRequest).toHaveBeenLastCalledWith(dinozToUpdate);
        });
    });
    it("Dinoz doesn't belong to player who made the request", function () {
        return __awaiter(this, void 0, void 0, function* () {
            dinozToUpdate.player.playerId = BigInt(constants_1.player.id_2);
            yield dinozService_1.setDinozName(req, res);
            expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
            expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(0);
            expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(parseInt(req.params.id));
        });
    });
    it('Dinoz name cannot be updated', function () {
        return __awaiter(this, void 0, void 0, function* () {
            dinozToUpdate.canChangeName = false;
            yield dinozService_1.setDinozName(req, res);
            expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
            expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(0);
            expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(parseInt(req.params.id));
        });
    });
});
//# sourceMappingURL=dinozServiceTest.js.map