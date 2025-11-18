import { Router } from 'express';
import { FeedController } from '@infrastructure/controllers/feed.controller';
import { FeedService } from '@application/services/feed.service';
import { authenticateToken } from "@infrastructure/middlewares/auth.middleware";
import { DreamNodeCommentController } from '@infrastructure/controllers/dream-node-comment.controller';
import { validateBody } from '@infrastructure/middlewares/validate-class.middleware';
import { CreateDreamNodeCommentDto } from '@infrastructure/dtos/dream-node/create-dream-node-comment.dto';

const feedController = new FeedController(new FeedService());
const feedRouter = Router();
const dreamNodeCommentController = new DreamNodeCommentController();

feedRouter.get('/', authenticateToken, (req, res) => feedController.getFeed(req, res));
feedRouter.post("/like", authenticateToken, (req, res) => feedController.likeNode(req, res));
feedRouter.post("/unlike", authenticateToken, (req, res) => feedController.unlikeNode(req, res));
feedRouter.get("/node/:nodeId/comments", (req, res) => dreamNodeCommentController.getComments(req, res));
feedRouter.post("/node/:nodeId/comments", authenticateToken, validateBody(CreateDreamNodeCommentDto), (req, res) => dreamNodeCommentController.addComment(req, res));

export { feedRouter };
