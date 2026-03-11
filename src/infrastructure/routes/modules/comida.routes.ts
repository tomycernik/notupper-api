import { Router } from 'express';
import { ComidaController } from '@infrastructure/controllers/comida.controller';
import { ComidaService } from '@application/services/comida.service';
import { ComidaRepositorySupabase } from '@infrastructure/repositories/comida.repository.supabase';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';
import { validateBody } from '@infrastructure/middlewares/validate-body.middleware';
import { CreateComidaDTO, UpdateComidaDTO } from '@infrastructure/dtos/comida/comida.dto';

const comidaRepository = new ComidaRepositorySupabase();
const comidaService = new ComidaService(comidaRepository);
const comidaController = new ComidaController(comidaService);

export const comidaRouter = Router();

// Pública: ver catálogo de comidas activas
comidaRouter.get('/', (req, res) => comidaController.obtenerTodas(req, res));
comidaRouter.get('/:id', (req, res) => comidaController.obtenerPorId(req, res));

// Solo admin: gestión del catálogo
comidaRouter.post('/', authenticateToken, requireAdmin, validateBody(CreateComidaDTO), (req, res) => comidaController.crear(req, res));
comidaRouter.patch('/:id', authenticateToken, requireAdmin, validateBody(UpdateComidaDTO), (req, res) => comidaController.actualizar(req, res));
comidaRouter.patch('/:id/toggle', authenticateToken, requireAdmin, (req, res) => comidaController.toggleActiva(req, res));
comidaRouter.delete('/:id', authenticateToken, requireAdmin, (req, res) => comidaController.eliminar(req, res));
