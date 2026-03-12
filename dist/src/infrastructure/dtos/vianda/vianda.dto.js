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
exports.AsignarComidasDTO = exports.UpdateViandaDTO = exports.CreateViandaDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateViandaDTO {
}
exports.CreateViandaDTO = CreateViandaDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateViandaDTO.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['COMUN', 'VEGETARIANA']),
    __metadata("design:type", String)
], CreateViandaDTO.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['CHICA', 'GRANDE']),
    __metadata("design:type", String)
], CreateViandaDTO.prototype, "tamano", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateViandaDTO.prototype, "activo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateViandaDTO.prototype, "observaciones", void 0);
class UpdateViandaDTO {
}
exports.UpdateViandaDTO = UpdateViandaDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateViandaDTO.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['COMUN', 'VEGETARIANA']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateViandaDTO.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['CHICA', 'GRANDE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateViandaDTO.prototype, "tamano", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateViandaDTO.prototype, "activo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateViandaDTO.prototype, "observaciones", void 0);
class ComidaOrdenDTO {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ComidaOrdenDTO.prototype, "comidaId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ComidaOrdenDTO.prototype, "orden", void 0);
class AsignarComidasDTO {
}
exports.AsignarComidasDTO = AsignarComidasDTO;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ComidaOrdenDTO),
    __metadata("design:type", Array)
], AsignarComidasDTO.prototype, "comidas", void 0);
//# sourceMappingURL=vianda.dto.js.map