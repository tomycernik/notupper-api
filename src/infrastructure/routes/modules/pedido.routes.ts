import { Router } from 'express';
import { PedidoController } from '@infrastructure/controllers/pedido.controller';
import { PedidoService } from '@application/services/pedido.service';
import { PedidoRepositorySupabase } from '@infrastructure/repositories/pedido.repository.supabase';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';
import { validateBody } from '@infrastructure/middlewares/validate-body.middleware';
import { CreatePedidoDTO, UpdateEstadoDTO } from '@infrastructure/dtos/pedido/pedido.dto';

const pedidoRepository = new PedidoRepositorySupabase();
const pedidoService = new PedidoService(pedidoRepository);
const pedidoController = new PedidoController(pedidoService);

export const pedidoRouter = Router();

// Usuario autenticado: sus pedidos
pedidoRouter.post('/', authenticateToken, validateBody(CreatePedidoDTO), (req, res) => pedidoController.crear(req, res));
pedidoRouter.get('/mis-pedidos', authenticateToken, (req, res) => pedidoController.obtenerMisPedidos(req, res));
pedidoRouter.patch('/:id/cancelar', authenticateToken, (req, res) => pedidoController.cancelar(req, res));

// Solo admin: gestión de todos los pedidos
pedidoRouter.get('/', authenticateToken, requireAdmin, (req, res) => pedidoController.obtenerTodos(req, res));
pedidoRouter.get('/:id', authenticateToken, requireAdmin, (req, res) => pedidoController.obtenerPorId(req, res));
pedidoRouter.patch('/:id/estado', authenticateToken, requireAdmin, validateBody(UpdateEstadoDTO), (req, res) => pedidoController.actualizarEstado(req, res));
pedidoRouter.delete('/:id', authenticateToken, requireAdmin, (req, res) => pedidoController.eliminar(req, res));
