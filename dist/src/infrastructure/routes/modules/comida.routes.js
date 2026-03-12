"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comidaRouter = void 0;
const express_1 = require("express");
const comida_controller_1 = require("@infrastructure/controllers/comida.controller");
const comida_service_1 = require("@application/services/comida.service");
const comida_repository_supabase_1 = require("@infrastructure/repositories/comida.repository.supabase");
const auth_middleware_1 = require("@infrastructure/middlewares/auth.middleware");
const validate_body_middleware_1 = require("@infrastructure/middlewares/validate-body.middleware");
const comida_dto_1 = require("@infrastructure/dtos/comida/comida.dto");
const comidaRepository = new comida_repository_supabase_1.ComidaRepositorySupabase();
const comidaService = new comida_service_1.ComidaService(comidaRepository);
const comidaController = new comida_controller_1.ComidaController(comidaService);
exports.comidaRouter = (0, express_1.Router)();
// Pública: ver catálogo de comidas activas
exports.comidaRouter.get('/', (req, res) => comidaController.obtenerTodas(req, res));
exports.comidaRouter.get('/:id', (req, res) => comidaController.obtenerPorId(req, res));
// Solo admin: gestión del catálogo
exports.comidaRouter.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (0, validate_body_middleware_1.validateBody)(comida_dto_1.CreateComidaDTO), (req, res) => comidaController.crear(req, res));
exports.comidaRouter.patch('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (0, validate_body_middleware_1.validateBody)(comida_dto_1.UpdateComidaDTO), (req, res) => comidaController.actualizar(req, res));
exports.comidaRouter.patch('/:id/toggle', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => comidaController.toggleActiva(req, res));
exports.comidaRouter.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => comidaController.eliminar(req, res));
//# sourceMappingURL=comida.routes.js.map