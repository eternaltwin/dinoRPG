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
exports.DinozRaceModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dinozModel_1 = require("./dinozModel");
const dinozShopModel_1 = require("./dinozShopModel");
const skillModel_1 = require("./skillModel");
let DinozRaceModel = class DinozRaceModel extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozRaceModel.prototype,
  "raceId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.HasMany(() => dinozModel_1.DinozModel, "dinozId"),
    __metadata("design:type", Array),
  ],
  DinozRaceModel.prototype,
  "dinoz",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.HasMany(
      () => dinozShopModel_1.DinozShopModel,
      "raceId"
    ),
    __metadata("design:type", Array),
  ],
  DinozRaceModel.prototype,
  "dinozShop",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  DinozRaceModel.prototype,
  "name",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozRaceModel.prototype,
  "nbrFireCase",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozRaceModel.prototype,
  "nbrWoodCase",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozRaceModel.prototype,
  "nbrWaterCase",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozRaceModel.prototype,
  "nbrlightCase",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozRaceModel.prototype,
  "nbrAirCase",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozRaceModel.prototype,
  "price",
  void 0
);
__decorate(
  [sequelize_typescript_1.Column, __metadata("design:type", String)],
  DinozRaceModel.prototype,
  "swfLetter",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => skillModel_1.SkillModel),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozRaceModel.prototype,
  "skillId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(() => skillModel_1.SkillModel, "skillId"),
    __metadata("design:type", skillModel_1.SkillModel),
  ],
  DinozRaceModel.prototype,
  "skill",
  void 0
);
DinozRaceModel = __decorate(
  [
    sequelize_typescript_1.Table({
      tableName: "tb_dinoz_race",
      timestamps: false,
    }),
  ],
  DinozRaceModel
);
exports.DinozRaceModel = DinozRaceModel;
//# sourceMappingURL=dinozRaceModel.js.map
