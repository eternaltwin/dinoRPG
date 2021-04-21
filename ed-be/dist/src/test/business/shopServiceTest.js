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
const models_1 = require("../../models");
const dinozShopData_1 = require("../data/dinozShopData");
const playerData_1 = require("../data/playerData");
const raceData_1 = require("../data/raceData");
const constants_1 = require("../utils/constants");
const shopService_1 = require("../../business/shopService");
const DinozShopDao = require('../../dao/shopDao');
const PlayerDao = require('../../dao/playerDao');
const DinozRaceDao = require('../../dao/dinozRaceDao');
const Config = require('../../utils/context');
let req = {
    user: {
        playerId: constants_1.player.id_1,
    },
};
let res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
};
describe('Test de la fonction getDinozFromDinozShop', function () {
    let dinozCreated;
    beforeEach(function () {
        dinozCreated = {
            playerId: constants_1.player.id_1,
            raceId: BigInt(54),
            display: '651fdsf68s',
        };
        const dinozBuilt = {
            get: jest.fn().mockResolvedValue(dinozCreated),
        };
        spyOn(DinozRaceDao, 'getRacesDetailsRequest').and.returnValue(raceData_1.DinozRaceArray);
        spyOn(DinozShopDao, 'createMultipleDinoz');
        spyOn(Config, 'getConfig').and.returnValue({
            shop: { dinozInShop: 4, buyableQuetzu: 6 },
        });
        spyOn(models_1.Dinoz, 'build').and.returnValue(dinozBuilt);
    });
    it('No dinoz found, shop must be initialized', function () {
        return __awaiter(this, void 0, void 0, function* () {
            spyOn(DinozShopDao, 'getDinozFromDinozShopRequest').and.returnValue([]);
            spyOn(PlayerDao, 'getPlayerRewardsRequest').and.returnValue(playerData_1.PlayerWithRewards);
            yield shopService_1.getDinozFromDinozShop(req, res);
            expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(2);
            expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);
            expect(DinozRaceDao.getRacesDetailsRequest).toHaveBeenCalledTimes(1);
            expect(DinozShopDao.createMultipleDinoz).toHaveBeenCalledTimes(1);
            expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(req.user.playerId);
            expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(req.user.playerId, expect.any(Array));
            expect(DinozRaceDao.getRacesDetailsRequest).toHaveBeenLastCalledWith(expect.any(Array));
            expect(DinozShopDao.createMultipleDinoz).toHaveBeenLastCalledWith(expect.any(Array));
        });
    });
    it('Dinoz already exist in shop', function () {
        return __awaiter(this, void 0, void 0, function* () {
            spyOn(DinozShopDao, 'getDinozFromDinozShopRequest').and.returnValue(dinozShopData_1.DinozShopArray);
            spyOn(PlayerDao, 'getPlayerRewardsRequest').and.returnValue(playerData_1.PlayerWithRewards);
            yield shopService_1.getDinozFromDinozShop(req, res);
            expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(1);
            expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(0);
            expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(req.user.playerId);
        });
    });
    it('Player found is null', function () {
        return __awaiter(this, void 0, void 0, function* () {
            spyOn(DinozShopDao, 'getDinozFromDinozShopRequest').and.returnValue([]);
            spyOn(PlayerDao, 'getPlayerRewardsRequest').and.returnValue(null);
            yield shopService_1.getDinozFromDinozShop(req, res);
            expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(1);
            expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);
            expect(DinozRaceDao.getRacesDetailsRequest).toHaveBeenCalledTimes(0);
            expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(req.user.playerId);
            expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(req.user.playerId, expect.any(Array));
        });
    });
});
//# sourceMappingURL=shopServiceTest.js.map