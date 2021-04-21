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
exports.getCommonData = void 0;
const playerDao_1 = require("../dao/playerDao");
const getCommonData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commonData = yield playerDao_1.getCommonDataRequest(req.user.playerId);
    return res.status(200).send(commonData);
});
exports.getCommonData = getCommonData;
//# sourceMappingURL=playerService.js.map