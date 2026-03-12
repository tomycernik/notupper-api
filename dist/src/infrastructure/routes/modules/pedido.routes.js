"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidoRouter = void 0;
const express_1 = require("express");
const pedido_controller_1 = require("@infrastructure/controllers/pedido.controller");
const pedido_service_1 = require("@application/services/pedido.service");
const pedido_repository_supabase_1 = require("@infrastructure/repositories/pedido.repository.supabase");
const auth_middleware_1 = require("@infrastructure/middlewares/auth.middleware");
const validate_body_middleware_1 = require("@infrastructure/middlewares/validate-body.middleware");
const pedido_dto_1 = require("@infrastructure/dtos/pedido/pedido.dto");
const pedidoRepository = new pedido_repository_supabase_1.PedidoRepositorySupabase();
const pedidoService = new pedido_service_1.PedidoService(pedidoRepository);
const pedidoController = new pedido_controller_1.PedidoController(pedidoService);
exports.pedidoRouter = (0, express_1.Router)();
// Usuario autenticado: sus pedidos
exports.pedidoRouter.post('/', auth_middleware_1.authenticateToken, (0, validate_body_middleware_1.validateBody)(pedido_dto_1.CreatePedidoDTO), (req, res) => pedidoController.crear(req, res));
exports.pedidoRouter.get('/mis-pedidos', auth_middleware_1.authenticateToken, (req, res) => pedidoController.obtenerMisPedidos(req, res));
exports.pedidoRouter.patch('/:id/cancelar', auth_middleware_1.authenticateToken, (req, res) => pedidoController.cancelar(req, res));
// Solo admin: gestión de todos los pedidos
exports.pedidoRouter.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => pedidoController.obtenerTodos(req, res));
exports.pedidoRouter.get('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => pedidoController.obtenerPorId(req, res));
exports.pedidoRouter.patch('/:id/estado', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (0, validate_body_middleware_1.validateBody)(pedido_dto_1.UpdateEstadoDTO), (req, res) => pedidoController.actualizarEstado(req, res));
exports.pedidoRouter.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => pedidoController.eliminar(req, res));
//# sourceMappingURL=pedido.routes.js.map