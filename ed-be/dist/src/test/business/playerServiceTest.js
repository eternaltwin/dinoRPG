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
const playerData_1 = require("../data/playerData");
const constants_1 = require("../utils/constants");
const playerService_1 = require("../../business/playerService");
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
describe('Test de la fonction getCommonData()', function () {
    beforeEach(function () {
        spyOn(PlayerDao, 'getCommonDataRequest').and.returnValue(playerData_1.BasicPlayer);
    });
    it('Cas nominal', function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield playerService_1.getCommonData(req, res);
            expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledTimes(1);
            expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledWith(req.user.playerId);
        });
    });
});
//# sourceMappingURL=playerServiceTest.js.map