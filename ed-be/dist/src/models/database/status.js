"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const assDinozStatus_1 = require("./assDinozStatus");
const dinoz_1 = require("./dinoz");
let Status = class Status extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], Status.prototype, "statusId", void 0);
__decorate([
    sequelize_typescript_1.BelongsToMany(() => dinoz_1.Dinoz, () => assDinozStatus_1.AssDinozStatus),
    __metadata("design:type", Array)
], Status.prototype, "dinoz", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Status.prototype, "name", void 0);
Status = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_status', timestamps: false })
], Status);
exports.Status = Status;
//# sourceMappingURL=status.js.map