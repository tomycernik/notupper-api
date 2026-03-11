import { Router } from 'express';
import { UserController } from '@infrastructure/controllers/user.controller';
import { UserService } from '@application/services/user.service';
import { UserRepositorySupabase } from '@infrastructure/repositories/user.repository.supabase';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';
import { validateBody } from '@infrastructure/middlewares/validate-body.middleware';
import { RegisterUserDTO, LoginDTO, UpdateUserDTO } from '@infrastructure/dtos/user/user.dto';

const userRepository = new UserRepositorySupabase();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const userRouter = Router();

// Auth pública
userRouter.post('/register', validateBody(RegisterUserDTO), (req, res) => userController.register(req, res));
userRouter.post('/login', validateBody(LoginDTO), (req, res) => userController.login(req, res));

// Usuario autenticado
userRouter.get('/me', authenticateToken, (req, res) => userController.getMe(req, res));
userRouter.patch('/me', authenticateToken, validateBody(UpdateUserDTO), (req, res) => userController.update(req, res));

// Solo admin
userRouter.get('/', authenticateToken, requireAdmin, (req, res) => userController.getAll(req, res));
userRouter.delete('/:id', authenticateToken, requireAdmin, (req, res) => userController.delete(req, res));
