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
exports.StatusModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const assDinozStatusModel_1 = require("./assDinozStatusModel");
const dinozModel_1 = require("./dinozModel");
let StatusModel = class StatusModel extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  StatusModel.prototype,
  "statusId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsToMany(
      () => dinozModel_1.DinozModel,
      () => assDinozStatusModel_1.AssDinozStatusModel
    ),
    __metadata("design:type", Array),
  ],
  StatusModel.prototype,
  "dinoz",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  StatusModel.prototype,
  "name",
  void 0
);
StatusModel = __decorate(
  [sequelize_typescript_1.Table({ tableName: "tb_status", timestamps: false })],
  StatusModel
);
exports.StatusModel = StatusModel;
//# sourceMappingURL=statusModel.js.map
