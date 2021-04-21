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
exports.AssDinozObject = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dinoz_1 = require("./dinoz");
const objet_1 = require("./objet");
let AssDinozObject = class AssDinozObject extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], AssDinozObject.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => dinoz_1.Dinoz),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], AssDinozObject.prototype, "dinozId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => dinoz_1.Dinoz, 'dinozId'),
    __metadata("design:type", dinoz_1.Dinoz)
], AssDinozObject.prototype, "dinoz", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => objet_1.Objet),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], AssDinozObject.prototype, "objectId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => objet_1.Objet, 'objectId'),
    __metadata("design:type", Object)
], AssDinozObject.prototype, "object", void 0);
AssDinozObject = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_ass_dinoz_object', timestamps: false })
], AssDinozObject);
exports.AssDinozObject = AssDinozObject;
//# sourceMappingURL=assDinozObject.js.map