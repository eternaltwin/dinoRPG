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
exports.ObjectModel = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const assDinozObjectModel_1 = require("./assDinozObjectModel");
let ObjectModel = class ObjectModel extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  ObjectModel.prototype,
  "objectId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.HasMany(
      () => assDinozObjectModel_1.AssDinozObjectModel
    ),
    __metadata("design:type", Array),
  ],
  ObjectModel.prototype,
  "assDinozObject",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  ObjectModel.prototype,
  "name",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  ObjectModel.prototype,
  "canBeUsedNow",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  ObjectModel.prototype,
  "canBeEquiped",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  ObjectModel.prototype,
  "price",
  void 0
);
ObjectModel = __decorate(
  [sequelize_typescript_1.Table({ tableName: "tb_object", timestamps: false })],
  ObjectModel
);
exports.ObjectModel = ObjectModel;
//# sourceMappingURL=objectModel.js.map
