import { Router } from "express";
import { UserController } from "@infrastructure/controllers/user.controller";
import { UserRepositorySupabase } from '@infrastructure/repositories/user.repository.supabase';
import { UserService } from "@application/services/user.service";
import { validateBody } from "@infrastructure/middlewares/validate-class.middleware";
import { RegisterUserDTO } from "@infrastructure/dtos/user/register-user.dto";
import { LoginDTO } from "@infrastructure/dtos/user/login.dto";
import { authenticateToken } from "@infrastructure/middlewares/auth.middleware";
import { SetActiveRoomDto } from "@infrastructure/dtos/room/set-active-room.dto";
import { SkinService } from "@application/services/skin.service";
import { RoomService } from "@application/services/room.service";
import { CoinRepositorySupabase } from "@infrastructure/repositories/coin.repository.supabase";
import { RoomRepositorySupabase } from "@infrastructure/repositories/room.repository.supabase";
import { SkinRepositorySupabase } from "@infrastructure/repositories/skin.repository.supabase";
import { MembershipService } from "@application/services/membership.service";

import { BadgeRepositorySupabase } from "@infrastructure/repositories/badge.repository.supabase";
import { BadgeService } from "@application/services/badge.service";
import { MembershipRepositorySupabase } from "@infrastructure/repositories/membership.repository.supabase";
import { SetFeaturedBadgesDto } from "@infrastructure/dtos/user/set-featured-badges.dto";

export const userRouter = Router();
const userRepository = new UserRepositorySupabase();
const skinRepository = new SkinRepositorySupabase();
const roomRepository = new RoomRepositorySupabase();
const membershipRepository= new MembershipRepositorySupabase();

const membershipService = new MembershipService(membershipRepository);
const skinService = new SkinService(skinRepository);
const coinRepository = new CoinRepositorySupabase();
const roomService = new RoomService(roomRepository, coinRepository);

const badgeRepository = new BadgeRepositorySupabase();
const badgeService = new BadgeService(badgeRepository);
const userService = new UserService(userRepository, membershipService, roomService);
const userController = new UserController(userService, skinService, roomService, badgeService);

userRouter.post("/register", validateBody(RegisterUserDTO),(req, res) => userController.register(req, res));
userRouter.post("/login", validateBody(LoginDTO), (req, res) => userController.login(req, res));
userRouter.get("/assets", authenticateToken, (req, res) => userController.getUserAssets(req, res));
userRouter.get("/skins", authenticateToken, (req, res) => userController.getUserSkins(req, res));
userRouter.get("/rooms", authenticateToken, (req, res) => userController.getUserRooms(req, res));
userRouter.get("/rooms/active", authenticateToken, (req, res) => userController.getActiveRoom(req, res));
userRouter.post("/rooms/active", authenticateToken, validateBody(SetActiveRoomDto), (req, res) => userController.setActiveRoom(req, res));
userRouter.get("/me", authenticateToken, (req, res) => userController.getUserInfo(req, res));
userRouter.get("/profile/:userId", (req, res) => userController.getPublicProfile(req, res));
userRouter.patch("/profile/featured-badges", authenticateToken, (req, res) => userController.setFeaturedBadges(req, res));
