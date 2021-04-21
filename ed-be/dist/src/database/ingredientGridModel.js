"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientGridModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const ingredientGridTypeModel_1 = require("./ingredientGridTypeModel");
const placeModel_1 = require("./placeModel");
const playerModel_1 = require("./playerModel");
let IngredientGridModel = class IngredientGridModel extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  IngredientGridModel.prototype,
  "gridId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => playerModel_1.PlayerModel),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  IngredientGridModel.prototype,
  "playerId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(
      () => playerModel_1.PlayerModel,
      "playerId"
    ),
    __metadata("design:type", playerModel_1.PlayerModel),
  ],
  IngredientGridModel.prototype,
  "player",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(
      () => ingredientGridTypeModel_1.IngredientGridTypeModel
    ),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  IngredientGridModel.prototype,
  "ingredientGridTypeId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(
      () => ingredientGridTypeModel_1.IngredientGridTypeModel,
      "ingredientGridTypeId"
    ),
    __metadata(
      "design:type",
      ingredientGridTypeModel_1.IngredientGridTypeModel
    ),
  ],
  IngredientGridModel.prototype,
  "ingredientGridType",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => placeModel_1.PlaceModel),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  IngredientGridModel.prototype,
  "placeId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(() => placeModel_1.PlaceModel, "placeId"),
    __metadata("design:type", placeModel_1.PlaceModel),
  ],
  IngredientGridModel.prototype,
  "place",
  void 0
);
IngredientGridModel = __decorate(
  [
    sequelize_typescript_1.Table({
      tableName: "tb_ingredient_grid",
      timestamps: false,
    }),
  ],
  IngredientGridModel
);
exports.IngredientGridModel = IngredientGridModel;
//# sourceMappingURL=ingredientGridModel.js.map
