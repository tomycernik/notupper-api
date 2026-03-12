"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viandaRouter = void 0;
const express_1 = require("express");
const vianda_controller_1 = require("@infrastructure/controllers/vianda.controller");
const vianda_service_1 = require("@application/services/vianda.service");
const vianda_repository_supabase_1 = require("@infrastructure/repositories/vianda.repository.supabase");
const auth_middleware_1 = require("@infrastructure/middlewares/auth.middleware");
const validate_body_middleware_1 = require("@infrastructure/middlewares/validate-body.middleware");
const vianda_dto_1 = require("@infrastructure/dtos/vianda/vianda.dto");
const viandaRepository = new vianda_repository_supabase_1.ViandaRepositorySupabase();
const viandaService = new vianda_service_1.ViandaService(viandaRepository);
const viandaController = new vianda_controller_1.ViandaController(viandaService);
exports.viandaRouter = (0, express_1.Router)();
// Pública: ver menú activo
exports.viandaRouter.get('/', (req, res) => viandaController.obtenerTodas(req, res));
exports.viandaRouter.get('/:id', (req, res) => viandaController.obtenerPorId(req, res));
// Solo admin: gestión de viandas y armado del menú
exports.viandaRouter.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (0, validate_body_middleware_1.validateBody)(vianda_dto_1.CreateViandaDTO), (req, res) => viandaController.crear(req, res));
exports.viandaRouter.patch('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (0, validate_body_middleware_1.validateBody)(vianda_dto_1.UpdateViandaDTO), (req, res) => viandaController.actualizar(req, res));
exports.viandaRouter.patch('/:id/toggle', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => viandaController.toggleActivo(req, res));
exports.viandaRouter.put('/:id/comidas', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (0, validate_body_middleware_1.validateBody)(vianda_dto_1.AsignarComidasDTO), (req, res) => viandaController.asignarComidas(req, res));
exports.viandaRouter.delete('/:id/comidas/:comidaId', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => viandaController.quitarComida(req, res));
exports.viandaRouter.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => viandaController.eliminar(req, res));
//# sourceMappingURL=vianda.routes.js.map