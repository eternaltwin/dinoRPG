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
exports.PlayerModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const assPlayerRewardModel_1 = require("./assPlayerRewardModel");
const dinozModel_1 = require("./dinozModel");
const dinozShopModel_1 = require("./dinozShopModel");
const epicRewardModel_1 = require("./epicRewardModel");
const ingredientGridModel_1 = require("./ingredientGridModel");
let PlayerModel = class PlayerModel extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  PlayerModel.prototype,
  "playerId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsToMany(
      () => epicRewardModel_1.EpicRewardModel,
      () => assPlayerRewardModel_1.AssPlayerRewardModel
    ),
    __metadata("design:type", Array),
  ],
  PlayerModel.prototype,
  "reward",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.HasMany(() => dinozModel_1.DinozModel, "playerId"),
    __metadata("design:type", Array),
  ],
  PlayerModel.prototype,
  "dinoz",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.HasMany(
      () => ingredientGridModel_1.IngredientGridModel,
      "playerId"
    ),
    __metadata("design:type", Array),
  ],
  PlayerModel.prototype,
  "ingredientGrid",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.HasMany(
      () => dinozShopModel_1.DinozShopModel,
      "playerId"
    ),
    __metadata("design:type", Array),
  ],
  PlayerModel.prototype,
  "dinozShop",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  PlayerModel.prototype,
  "name",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  PlayerModel.prototype,
  "eternalTwinId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  PlayerModel.prototype,
  "money",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  PlayerModel.prototype,
  "quetzuBought",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  PlayerModel.prototype,
  "leader",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  PlayerModel.prototype,
  "engineer",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  PlayerModel.prototype,
  "cooker",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  PlayerModel.prototype,
  "shopKeeper",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  PlayerModel.prototype,
  "merchant",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  PlayerModel.prototype,
  "priest",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  PlayerModel.prototype,
  "teacher",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.CreatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date),
  ],
  PlayerModel.prototype,
  "createdAt",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.UpdatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date),
  ],
  PlayerModel.prototype,
  "updatedAt",
  void 0
);
PlayerModel = __decorate(
  [sequelize_typescript_1.Table({ tableName: "tb_player", timestamps: true })],
  PlayerModel
);
exports.PlayerModel = PlayerModel;
//# sourceMappingURL=playerModel.js.map
