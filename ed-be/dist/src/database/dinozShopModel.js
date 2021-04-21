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
exports.DinozShopModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dinozRaceModel_1 = require("./dinozRaceModel");
const playerModel_1 = require("./playerModel");
let DinozShopModel = class DinozShopModel extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozShopModel.prototype,
  "id",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => playerModel_1.PlayerModel),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozShopModel.prototype,
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
  DinozShopModel.prototype,
  "player",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => dinozRaceModel_1.DinozRaceModel),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozShopModel.prototype,
  "raceId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(
      () => dinozRaceModel_1.DinozRaceModel,
      "raceId"
    ),
    __metadata("design:type", dinozRaceModel_1.DinozRaceModel),
  ],
  DinozShopModel.prototype,
  "race",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  DinozShopModel.prototype,
  "display",
  void 0
);
DinozShopModel = __decorate(
  [
    sequelize_typescript_1.Table({
      tableName: "tb_dinoz_shop",
      timestamps: false,
    }),
  ],
  DinozShopModel
);
exports.DinozShopModel = DinozShopModel;
//# sourceMappingURL=dinozShopModel.js.map
