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
exports.DinozModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dinozRaceModel_1 = require("./dinozRaceModel");
const elementModel_1 = require("./elementModel");
const levelModel_1 = require("./levelModel");
const missionModel_1 = require("./missionModel");
const placeModel_1 = require("./placeModel");
const playerModel_1 = require("./playerModel");
const skillModel_1 = require("./skillModel");
const statusModel_1 = require("./statusModel");
const assDinozObjectModel_1 = require("./assDinozObjectModel");
const assDinozSkillModel_1 = require("./assDinozSkillModel");
const assDinozStatusModel_1 = require("./assDinozStatusModel");
let DinozModel = class DinozModel extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
  "dinozId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.HasMany(
      () => assDinozObjectModel_1.AssDinozObjectModel
    ),
    __metadata("design:type", Array),
  ],
  DinozModel.prototype,
  "assDinozObject",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsToMany(
      () => skillModel_1.SkillModel,
      () => assDinozSkillModel_1.AssDinozSkillModel
    ),
    __metadata("design:type", Array),
  ],
  DinozModel.prototype,
  "skill",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsToMany(
      () => statusModel_1.StatusModel,
      () => assDinozStatusModel_1.AssDinozStatusModel
    ),
    __metadata("design:type", Array),
  ],
  DinozModel.prototype,
  "status",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
  "following",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  DinozModel.prototype,
  "name",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  DinozModel.prototype,
  "isFrozen",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => dinozRaceModel_1.DinozRaceModel),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
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
  DinozModel.prototype,
  "race",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => levelModel_1.LevelModel),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
  "levelId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(() => levelModel_1.LevelModel, "levelId"),
    __metadata("design:type", levelModel_1.LevelModel),
  ],
  DinozModel.prototype,
  "level",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => missionModel_1.MissionModel),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
  "missionId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(
      () => missionModel_1.MissionModel,
      "missionId"
    ),
    __metadata("design:type", missionModel_1.MissionModel),
  ],
  DinozModel.prototype,
  "mission",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => elementModel_1.ElementModel),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
  "nextUpElementId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(
      () => elementModel_1.ElementModel,
      "nextUpElementId"
    ),
    __metadata("design:type", elementModel_1.ElementModel),
  ],
  DinozModel.prototype,
  "nextUp",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => elementModel_1.ElementModel),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
  "nextUpAltElementId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(
      () => elementModel_1.ElementModel,
      "nextUpAltElementId"
    ),
    __metadata("design:type", elementModel_1.ElementModel),
  ],
  DinozModel.prototype,
  "nextUpAlt",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => playerModel_1.PlayerModel),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
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
  DinozModel.prototype,
  "player",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => placeModel_1.PlaceModel),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozModel.prototype,
  "placeId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(() => placeModel_1.PlaceModel, "placeId"),
    __metadata("design:type", placeModel_1.PlaceModel),
  ],
  DinozModel.prototype,
  "place",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  DinozModel.prototype,
  "canChangeName",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  DinozModel.prototype,
  "display",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozModel.prototype,
  "life",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozModel.prototype,
  "experience",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  DinozModel.prototype,
  "canGather",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozModel.prototype,
  "nbrUpFire",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozModel.prototype,
  "nbrUpWood",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozModel.prototype,
  "nbrUpWater",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozModel.prototype,
  "nbrUpLight",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  DinozModel.prototype,
  "nbrUpAir",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.CreatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date),
  ],
  DinozModel.prototype,
  "createdAt",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.UpdatedAt,
    sequelize_typescript_1.Column,
    __metadata("design:type", Date),
  ],
  DinozModel.prototype,
  "updatedAt",
  void 0
);
DinozModel = __decorate(
  [sequelize_typescript_1.Table({ tableName: "tb_dinoz", timestamps: true })],
  DinozModel
);
exports.DinozModel = DinozModel;
//# sourceMappingURL=dinozModel.js.map
