import { Router } from 'express';
import { FeedController } from '@infrastructure/controllers/feed.controller';
import { FeedService } from '@application/services/feed.service';
import { authenticateToken } from "@infrastructure/middlewares/auth.middleware";

const feedController = new FeedController(new FeedService());
const feedRouter = Router();

feedRouter.get('/', authenticateToken, (req, res) => feedController.getFeed(req, res));
feedRouter.post("/like", authenticateToken, (req, res) => feedController.likeNode(req, res));
feedRouter.post("/unlike", authenticateToken, (req, res) => feedController.unlikeNode(req, res));

export { feedRouter };
