import { Router } from 'express';
import { BadgeController } from '@infrastructure/controllers/badge.controller';
import { authenticateToken } from '@infrastructure/middlewares/auth.middleware';
import { BadgeRepositorySupabase } from '@infrastructure/repositories/badge.repository.supabase';

export const badgeRouter = Router();

const badgeRepository = new BadgeRepositorySupabase();
const controller = new BadgeController(badgeRepository);

badgeRouter.get('/my', authenticateToken, (req, res) => controller.myBadges(req, res));
