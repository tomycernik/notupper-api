import { Router } from 'express';
import { SkinController } from '@infrastructure/controllers/skin.controller';
import { SkinService } from '@application/services/skin.service';
import { SkinRepositorySupabase } from '@infrastructure/repositories/skin.repository.supabase';
import { CoinRepositorySupabase } from '@infrastructure/repositories/coin.repository.supabase';
import { MembershipService } from '@application/services/membership.service';
import { MembershipRepositorySupabase } from '@infrastructure/repositories/membership.repository.supabase';
import { authenticateToken } from '@infrastructure/middlewares/auth.middleware';

const skinRepository = new SkinRepositorySupabase();
const coinRepository = new CoinRepositorySupabase();
const skinService = new SkinService(skinRepository, coinRepository);
const membershipRepository = new MembershipRepositorySupabase();
const membershipService = new MembershipService(membershipRepository);
const skinController = new SkinController(skinService, membershipService);

export const skinRouter = Router();

// GET /api/skins - Obtener todas las skins (paginado)
skinRouter.get('/', authenticateToken, (req, res) => skinController.getAllSkins(req, res));

// POST /api/skins/buy - Comprar skin con monedas
skinRouter.post('/buy', authenticateToken, (req, res) => skinController.buySkin(req, res));

// POST /api/skins - Agregar skin al usuario (requiere Plus)
skinRouter.post('/', authenticateToken, (req, res) => skinController.addSkinToUser(req, res));
