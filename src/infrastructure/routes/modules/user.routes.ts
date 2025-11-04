import { Router } from "express";
import { UserController } from "../../controllers/user.controller";
import { UserRepositorySupabase } from './../../repositories/user.repository.supabase';
import { UserService } from "../../../application/services/user.service";
import { validateBody } from "../../middlewares/validate-class.middleware";
import { RegisterUserDTO } from "../../dtos/user/register-user.dto";
import { LoginDTO } from "../../dtos/user/login.dto";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { SetActiveRoomDto } from "../../dtos/room/set-active-room.dto";
import { SkinService } from "../../../application/services/skin.service";
import { RoomService } from "../../../application/services/room.service";
import { RoomRepositorySupabase } from "../../repositories/room.repository.supabase";
import { SkinRepositorySupabase } from "../../repositories/skin.repository.supabase";
import { MembershipService } from "../../../application/services/membership.service";
import { MembershipRepositorySupabase } from "../../repositories/membership.repository.supabase";

export const userRouter = Router();
const userRepository = new UserRepositorySupabase();
const skinRepository = new SkinRepositorySupabase();
const roomRepository = new RoomRepositorySupabase();
const membershipRepository= new MembershipRepositorySupabase();

const membershipService = new MembershipService(membershipRepository);
const skinService = new SkinService(skinRepository);
const roomService = new RoomService(roomRepository);
const userService = new UserService(userRepository ,membershipService, roomService);
const userController = new UserController(userService, skinService, roomService);

userRouter.post("/register", validateBody(RegisterUserDTO),(req, res) => userController.register(req, res));
userRouter.post("/login", validateBody(LoginDTO), (req, res) => userController.login(req, res));
userRouter.get("/assets", authenticateToken, (req, res) => userController.getUserAssets(req, res));
userRouter.get("/skins", authenticateToken, (req, res) => userController.getUserSkins(req, res));
userRouter.get("/rooms", authenticateToken, (req, res) => userController.getUserRooms(req, res));
userRouter.get("/rooms/active", authenticateToken, (req, res) => userController.getActiveRoom(req, res));
userRouter.post("/rooms/active", authenticateToken, validateBody(SetActiveRoomDto), (req, res) => userController.setActiveRoom(req, res));
userRouter.get("/me", authenticateToken, (req, res) => userController.getUserInfo(req, res));
