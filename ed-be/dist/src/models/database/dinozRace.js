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
exports.DinozRace = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dinoz_1 = require("./dinoz");
const dinozShop_1 = require("./dinozShop");
const skill_1 = require("./skill");
let DinozRace = class DinozRace extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], DinozRace.prototype, "raceId", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => dinoz_1.Dinoz, 'raceId'),
    __metadata("design:type", Array)
], DinozRace.prototype, "dinoz", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => dinozShop_1.DinozShop, 'raceId'),
    __metadata("design:type", Array)
], DinozRace.prototype, "dinozShop", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], DinozRace.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], DinozRace.prototype, "nbrFireCase", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], DinozRace.prototype, "nbrWoodCase", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], DinozRace.prototype, "nbrWaterCase", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], DinozRace.prototype, "nbrLightCase", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], DinozRace.prototype, "nbrAirCase", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], DinozRace.prototype, "price", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], DinozRace.prototype, "swfLetter", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => skill_1.Skill),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], DinozRace.prototype, "skillId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => skill_1.Skill, 'skillId'),
    __metadata("design:type", skill_1.Skill)
], DinozRace.prototype, "skill", void 0);
DinozRace = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_dinoz_race', timestamps: false })
], DinozRace);
exports.DinozRace = DinozRace;
//# sourceMappingURL=dinozRace.js.map