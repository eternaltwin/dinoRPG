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
exports.PlaceAccess = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const place_1 = require("./place");
let PlaceAccess = class PlaceAccess extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], PlaceAccess.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => place_1.Place),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], PlaceAccess.prototype, "placeId", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => place_1.Place, 'placeId'),
    __metadata("design:type", place_1.Place)
], PlaceAccess.prototype, "place", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", typeof BigInt === "function" ? BigInt : Object)
], PlaceAccess.prototype, "canGoTo", void 0);
PlaceAccess = __decorate([
    sequelize_typescript_1.Table({ tableName: 'tb_place_access', timestamps: false })
], PlaceAccess);
exports.PlaceAccess = PlaceAccess;
//# sourceMappingURL=placeAccess.js.map