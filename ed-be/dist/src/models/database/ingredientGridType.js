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
exports.IngredientGridType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const ingredientGrid_1 = require("./ingredientGrid");
const ingredient_1 = require("./ingredient");
let IngredientGridType = class IngredientGridType extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], IngredientGridType.prototype, "ingredientGridTypeId", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => ingredientGrid_1.IngredientGrid, 'ingredientGridId'),
    __metadata("design:type", Array)
], IngredientGridType.prototype, "ingredientGrid", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => ingredient_1.Ingredient, 'ingredientId'),
    __metadata("design:type", Array)
], IngredientGridType.prototype, "ingredient", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], IngredientGridType.prototype, "length", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], IngredientGridType.prototype, "width", void 0);
IngredientGridType = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_ingredient_grid_type', timestamps: false })
], IngredientGridType);
exports.IngredientGridType = IngredientGridType;
//# sourceMappingURL=ingredientGridType.js.map