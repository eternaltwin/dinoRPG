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
exports.Skill = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const assDinozSkill_1 = require("./assDinozSkill");
const dinoz_1 = require("./dinoz");
const dinozRace_1 = require("./dinozRace");
let Skill = class Skill extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Skill.prototype, "skillId", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => dinoz_1.Dinoz, () => assDinozSkill_1.AssDinozSkill),
    __metadata("design:type", Array)
], Skill.prototype, "dinoz", void 0);
__decorate([
    sequelize_typescript_1.HasOne(() => dinozRace_1.DinozRace, 'skillId'),
    __metadata("design:type", dinozRace_1.DinozRace)
], Skill.prototype, "race", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Skill.prototype, "type", void 0);
Skill = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_skill', timestamps: false })
], Skill);
exports.Skill = Skill;
//# sourceMappingURL=skill.js.map