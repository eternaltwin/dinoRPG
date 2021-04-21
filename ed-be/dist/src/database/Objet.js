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
exports.Objet = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let Objet = class Objet extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  Objet.prototype,
  "objectId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String),
  ],
  Objet.prototype,
  "name",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  Objet.prototype,
  "canBeUsedNow",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean),
  ],
  Objet.prototype,
  "canBeEquiped",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number),
  ],
  Objet.prototype,
  "price",
  void 0
);
__decorate(
  [sequelize_typescript_1.Column, __metadata("design:type", Boolean)],
  Objet.prototype,
  "test",
  void 0
);
Objet = __decorate(
  [sequelize_typescript_1.Table({ tableName: "tb_object" })],
  Objet
);
exports.Objet = Objet;
/*export default function(sequelize: Sequelize) {
    var object = sequelize.define("object", {
      objectId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      canBeUsedNow: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      canBeEquiped: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      timestamps: false,
      tableName: 'tb_object'
    });
    
    return object;
  };*/
//# sourceMappingURL=Objet.js.map
