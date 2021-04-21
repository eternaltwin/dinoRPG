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
exports.SkillModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const assDinozSkillModel_1 = require("./assDinozSkillModel");
const dinozModel_1 = require("./dinozModel");
const dinozRaceModel_1 = require("./dinozRaceModel");
let SkillModel = class SkillModel extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  SkillModel.prototype,
  "skillId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsToMany(
      () => dinozModel_1.DinozModel,
      () => assDinozSkillModel_1.AssDinozSkillModel
    ),
    __metadata("design:type", Array),
  ],
  SkillModel.prototype,
  "dinoz",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.HasOne(
      () => dinozRaceModel_1.DinozRaceModel,
      "skillId"
    ),
    __metadata("design:type", dinozRaceModel_1.DinozRaceModel),
  ],
  SkillModel.prototype,
  "race",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  SkillModel.prototype,
  "name",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  SkillModel.prototype,
  "type",
  void 0
);
SkillModel = __decorate(
  [sequelize_typescript_1.Table({ tableName: "tb_skill", timestamps: false })],
  SkillModel
);
exports.SkillModel = SkillModel;
//# sourceMappingURL=skillModel.js.map
