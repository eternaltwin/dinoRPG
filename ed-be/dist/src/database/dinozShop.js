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
exports.DinozShop = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const objet_1 = require("./objet");
let DinozShop = class DinozShop extends sequelize_typescript_1.Model {};
__decorate(
  [
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozShop.prototype,
  "id",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.ForeignKey(() => objet_1.Objet),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object),
  ],
  DinozShop.prototype,
  "playerId",
  void 0
);
__decorate(
  [
    sequelize_typescript_1.BelongsTo(() => objet_1.Objet),
    __metadata("design:type", Object),
  ],
  DinozShop.prototype,
  "player",
  void 0
);
DinozShop = __decorate(
  [
    sequelize_typescript_1.Table({
      tableName: "tb_dinoz_shop",
      timestamps: false,
    }),
  ],
  DinozShop
);
exports.DinozShop = DinozShop;
/*export default function(sequelize: Sequelize) {
    var dinozShop = sequelize.define("dinozShop", {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      playerId: {
          type: DataTypes.BIGINT,
          allowNull: false
      },
      raceId: {
          type: DataTypes.BIGINT,
          allowNull: false
      },
      display: {
          type: DataTypes.STRING,
          allowNull: false
      }
    }, {
      timestamps: false,
      tableName: 'tb_dinoz_shop'
    });
    
    return dinozShop;
  };*/
//# sourceMappingURL=dinozShop.js.map
