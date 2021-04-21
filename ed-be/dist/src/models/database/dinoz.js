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
exports.Dinoz = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dinozRace_1 = require("./dinozRace");
const element_1 = require("./element");
const level_1 = require("./level");
const mission_1 = require("./mission");
const place_1 = require("./place");
const player_1 = require("./player");
const skill_1 = require("./skill");
const status_1 = require("./status");
const assDinozObject_1 = require("./assDinozObject");
const assDinozSkill_1 = require("./assDinozSkill");
const assDinozStatus_1 = require("./assDinozStatus");
let Dinoz = class Dinoz extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "dinozId", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => assDinozObject_1.AssDinozObject),
    __metadata("design:type", Array)
], Dinoz.prototype, "assDinozObject", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => skill_1.Skill, () => assDinozSkill_1.AssDinozSkill),
    __metadata("design:type", Array)
], Dinoz.prototype, "skill", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => status_1.Status, () => assDinozStatus_1.AssDinozStatus),
    __metadata("design:type", Array)
], Dinoz.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "following", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Dinoz.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Dinoz.prototype, "isFrozen", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => dinozRace_1.DinozRace),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "raceId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => dinozRace_1.DinozRace, 'raceId'),
    __metadata("design:type", dinozRace_1.DinozRace)
], Dinoz.prototype, "race", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => level_1.Level),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "levelId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => level_1.Level, 'levelId'),
    __metadata("design:type", level_1.Level)
], Dinoz.prototype, "level", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => mission_1.Mission),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "missionId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => mission_1.Mission, 'missionId'),
    __metadata("design:type", mission_1.Mission)
], Dinoz.prototype, "mission", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => element_1.Element),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "nextUpElementId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => element_1.Element, 'nextUpElementId'),
    __metadata("design:type", element_1.Element)
], Dinoz.prototype, "nextUp", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => element_1.Element),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "nextUpAltElementId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => element_1.Element, 'nextUpAltElementId'),
    __metadata("design:type", element_1.Element)
], Dinoz.prototype, "nextUpAlt", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => player_1.Player),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "playerId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => player_1.Player, 'playerId'),
    __metadata("design:type", player_1.Player)
], Dinoz.prototype, "player", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => place_1.Place),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Dinoz.prototype, "placeId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => place_1.Place, 'placeId'),
    __metadata("design:type", place_1.Place)
], Dinoz.prototype, "place", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Dinoz.prototype, "canChangeName", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Dinoz.prototype, "display", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Dinoz.prototype, "life", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Dinoz.prototype, "experience", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Dinoz.prototype, "canGather", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Dinoz.prototype, "nbrUpFire", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Dinoz.prototype, "nbrUpWood", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Dinoz.prototype, "nbrUpWater", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Dinoz.prototype, "nbrUpLight", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Dinoz.prototype, "nbrUpAir", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Dinoz.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Dinoz.prototype, "updatedAt", void 0);
Dinoz = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_dinoz', timestamps: true })
], Dinoz);
exports.Dinoz = Dinoz;
//# sourceMappingURL=dinoz.js.map