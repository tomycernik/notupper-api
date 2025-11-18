import { Router } from 'express';
import { FeedController } from '@infrastructure/controllers/feed.controller';
import { FeedService } from '@application/services/feed.service';
import { authenticateToken } from "@infrastructure/middlewares/auth.middleware";
import { DreamNodeCommentController } from '@infrastructure/controllers/dream-node-comment.controller';
import { validateBody } from '@infrastructure/middlewares/validate-class.middleware';
import { CreateDreamNodeCommentDto } from '@infrastructure/dtos/dream-node/create-dream-node-comment.dto';
import { UserService } from '@/application/services/user.service';
import { UserRepositorySupabase } from '@/infrastructure/repositories/user.repository.supabase';
import { MembershipService } from '@/application/services/membership.service';
import { MembershipRepositorySupabase } from '@/infrastructure/repositories/membership.repository.supabase';
import { NotificationService } from '@/application/services/notification.service';
import { NotificationRepositorySupabase } from '@/infrastructure/repositories/notification.repository.supabase';
import { RoomRepositorySupabase } from '@/infrastructure/repositories/room.repository.supabase';
import { RoomService } from '@/application/services/room.service';
import { CoinRepositorySupabase } from '@/infrastructure/repositories/coin.repository.supabase';

const notificationRepository = new NotificationRepositorySupabase()
const notificationService = new NotificationService(notificationRepository)
const membershipRepository = new MembershipRepositorySupabase()
const membershipService = new MembershipService(membershipRepository);
const roomRepository = new RoomRepositorySupabase();
const coinRepository = new CoinRepositorySupabase()
const roomService = new RoomService(roomRepository,coinRepository)
const feedController = new FeedController(new FeedService(), new UserService(new UserRepositorySupabase(), membershipService, roomService), notificationService);
const feedRouter = Router();
const userRepository = new UserRepositorySupabase()
const userService = new UserService(userRepository, membershipService, roomService)
const dreamNodeCommentController = new DreamNodeCommentController(userService, notificationService);

feedRouter.get('/', authenticateToken, (req, res) => feedController.getFeed(req, res));
feedRouter.post("/like", authenticateToken, (req, res) => feedController.likeNode(req, res));
feedRouter.post("/unlike", authenticateToken, (req, res) => feedController.unlikeNode(req, res));
feedRouter.get("/node/:nodeId/comments", (req, res) => dreamNodeCommentController.getComments(req, res));
feedRouter.post("/node/:nodeId/comments", authenticateToken, validateBody(CreateDreamNodeCommentDto), (req, res) => dreamNodeCommentController.addComment(req, res));

export { feedRouter };
