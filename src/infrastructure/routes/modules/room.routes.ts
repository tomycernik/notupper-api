import { Router } from 'express';
import { RoomController } from '@infrastructure/controllers/room.controller';
import { RoomService } from '@application/services/room.service';
import { RoomRepositorySupabase } from '@infrastructure/repositories/room.repository.supabase';
import { MembershipService } from '@application/services/membership.service';
import { MembershipRepositorySupabase } from '@infrastructure/repositories/membership.repository.supabase';
import { authenticateToken } from '@infrastructure/middlewares/auth.middleware';

const roomRepository = new RoomRepositorySupabase();
const roomService = new RoomService(roomRepository);
const membershipRepository = new MembershipRepositorySupabase();
const membershipService = new MembershipService(membershipRepository);
const roomController = new RoomController(roomService, membershipService);

export const roomRouter = Router();

// GET /api/rooms - Obtener todas las habitaciones (paginado)
roomRouter.get('/', authenticateToken, (req, res) => roomController.getAllRooms(req, res));

// POST /api/rooms - Agregar habitación al usuario (requiere Plus)
roomRouter.post('/', authenticateToken, (req, res) => roomController.addRoomToUser(req, res));
