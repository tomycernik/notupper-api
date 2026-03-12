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
exports.UpdateComidaDTO = exports.CreateComidaDTO = void 0;
const class_validator_1 = require("class-validator");
class CreateComidaDTO {
}
exports.CreateComidaDTO = CreateComidaDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateComidaDTO.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateComidaDTO.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['COMUN', 'VEGETARIANA', 'AMBAS']),
    __metadata("design:type", String)
], CreateComidaDTO.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateComidaDTO.prototype, "activa", void 0);
class UpdateComidaDTO {
}
exports.UpdateComidaDTO = UpdateComidaDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateComidaDTO.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateComidaDTO.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['COMUN', 'VEGETARIANA', 'AMBAS']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateComidaDTO.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateComidaDTO.prototype, "activa", void 0);
//# sourceMappingURL=comida.dto.js.map