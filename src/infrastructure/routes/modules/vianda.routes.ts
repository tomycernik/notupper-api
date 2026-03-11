import { Router } from 'express';
import { ViandaController } from '@infrastructure/controllers/vianda.controller';
import { ViandaService } from '@application/services/vianda.service';
import { ViandaRepositorySupabase } from '@infrastructure/repositories/vianda.repository.supabase';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';
import { validateBody } from '@infrastructure/middlewares/validate-body.middleware';
import { CreateViandaDTO, UpdateViandaDTO, AsignarComidasDTO } from '@infrastructure/dtos/vianda/vianda.dto';

const viandaRepository = new ViandaRepositorySupabase();
const viandaService = new ViandaService(viandaRepository);
const viandaController = new ViandaController(viandaService);

export const viandaRouter = Router();

// Pública: ver menú activo
viandaRouter.get('/', (req, res) => viandaController.obtenerTodas(req, res));
viandaRouter.get('/:id', (req, res) => viandaController.obtenerPorId(req, res));

// Solo admin: gestión de viandas y armado del menú
viandaRouter.post('/', authenticateToken, requireAdmin, validateBody(CreateViandaDTO), (req, res) => viandaController.crear(req, res));
viandaRouter.patch('/:id', authenticateToken, requireAdmin, validateBody(UpdateViandaDTO), (req, res) => viandaController.actualizar(req, res));
viandaRouter.patch('/:id/toggle', authenticateToken, requireAdmin, (req, res) => viandaController.toggleActivo(req, res));
viandaRouter.put('/:id/comidas', authenticateToken, requireAdmin, validateBody(AsignarComidasDTO), (req, res) => viandaController.asignarComidas(req, res));
viandaRouter.delete('/:id/comidas/:comidaId', authenticateToken, requireAdmin, (req, res) => viandaController.quitarComida(req, res));
viandaRouter.delete('/:id', authenticateToken, requireAdmin, (req, res) => viandaController.eliminar(req, res));
