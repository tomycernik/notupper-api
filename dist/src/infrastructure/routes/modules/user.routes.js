"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("@infrastructure/controllers/user.controller");
const user_service_1 = require("@application/services/user.service");
const user_repository_supabase_1 = require("@infrastructure/repositories/user.repository.supabase");
const auth_middleware_1 = require("@infrastructure/middlewares/auth.middleware");
const validate_body_middleware_1 = require("@infrastructure/middlewares/validate-body.middleware");
const user_dto_1 = require("@infrastructure/dtos/user/user.dto");
const userRepository = new user_repository_supabase_1.UserRepositorySupabase();
const userService = new user_service_1.UserService(userRepository);
const userController = new user_controller_1.UserController(userService);
exports.userRouter = (0, express_1.Router)();
// Auth pública
exports.userRouter.post('/register', (0, validate_body_middleware_1.validateBody)(user_dto_1.RegisterUserDTO), (req, res) => userController.register(req, res));
exports.userRouter.post('/login', (0, validate_body_middleware_1.validateBody)(user_dto_1.LoginDTO), (req, res) => userController.login(req, res));
// Usuario autenticado
exports.userRouter.get('/me', auth_middleware_1.authenticateToken, (req, res) => userController.getMe(req, res));
exports.userRouter.patch('/me', auth_middleware_1.authenticateToken, (0, validate_body_middleware_1.validateBody)(user_dto_1.UpdateUserDTO), (req, res) => userController.update(req, res));
// Solo admin
exports.userRouter.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => userController.getAll(req, res));
exports.userRouter.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, (req, res) => userController.delete(req, res));
//# sourceMappingURL=user.routes.js.map