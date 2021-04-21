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
exports.Player = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const assPlayerReward_1 = require("./assPlayerReward");
const dinoz_1 = require("./dinoz");
const dinozShop_1 = require("./dinozShop");
const epicReward_1 = require("./epicReward");
const ingredientGrid_1 = require("./ingredientGrid");
let Player = class Player extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Player.prototype, "playerId", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => epicReward_1.EpicReward, () => assPlayerReward_1.AssPlayerReward),
    __metadata("design:type", Array)
], Player.prototype, "reward", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => dinoz_1.Dinoz, 'playerId'),
    __metadata("design:type", Array)
], Player.prototype, "dinoz", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => ingredientGrid_1.IngredientGrid, 'playerId'),
    __metadata("design:type", Array)
], Player.prototype, "ingredientGrid", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => dinozShop_1.DinozShop, 'playerId'),
    __metadata("design:type", Array)
], Player.prototype, "dinozShop", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Player.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Player.prototype, "eternalTwinId", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Player.prototype, "money", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Player.prototype, "quetzuBought", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Player.prototype, "leader", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Player.prototype, "engineer", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Player.prototype, "cooker", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Player.prototype, "shopKeeper", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Player.prototype, "merchant", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Player.prototype, "priest", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Player.prototype, "teacher", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Player.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Player.prototype, "updatedAt", void 0);
Player = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_player', timestamps: true })
], Player);
exports.Player = Player;
//# sourceMappingURL=player.js.map