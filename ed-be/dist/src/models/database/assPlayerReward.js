"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssPlayerReward = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const epicReward_1 = require("./epicReward");
const player_1 = require("./player");
let AssPlayerReward = class AssPlayerReward extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => player_1.Player),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], AssPlayerReward.prototype, "playerId", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => epicReward_1.EpicReward),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], AssPlayerReward.prototype, "rewardId", void 0);
AssPlayerReward = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_ass_player_reward', timestamps: false })
], AssPlayerReward);
exports.AssPlayerReward = AssPlayerReward;
//# sourceMappingURL=assPlayerReward.js.map