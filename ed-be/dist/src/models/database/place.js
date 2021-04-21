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
exports.Place = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dinoz_1 = require("./dinoz");
const ingredientGrid_1 = require("./ingredientGrid");
const map_1 = require("./map");
const placeAccess_1 = require("./placeAccess");
let Place = class Place extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Place.prototype, "placeId", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Place.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => placeAccess_1.PlaceAccess),
    __metadata("design:type", Array)
], Place.prototype, "placeAccess", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => map_1.Map),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Place.prototype, "mapId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => map_1.Map, 'mapId'),
    __metadata("design:type", map_1.Map)
], Place.prototype, "map", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => ingredientGrid_1.IngredientGrid, 'ingredientGridId'),
    __metadata("design:type", Array)
], Place.prototype, "ingredientGrid", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => dinoz_1.Dinoz, 'dinozId'),
    __metadata("design:type", Array)
], Place.prototype, "dinoz", void 0);
Place = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_place', timestamps: false })
], Place);
exports.Place = Place;
//# sourceMappingURL=place.js.map