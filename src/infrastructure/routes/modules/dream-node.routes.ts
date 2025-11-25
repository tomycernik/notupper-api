import { Router } from "express";
import { DreamNodeController } from "@infrastructure/controllers/dream-node.controller";
import { InterpretationOpenAIProvider } from "@infrastructure/providers/interpretation-openAI.provider";
import { InterpretationDreamService } from "@application/services/interpretation-dream.service";
import { DreamNodeService } from "@application/services/dream-node.service";
import { DreamNodeRepositorySupabase } from "@infrastructure/repositories/dream-node.repository.supabase";
import { validateBody, validateQuery } from "@infrastructure/middlewares/validate-class.middleware";
import contentModerationMiddleware from '@infrastructure/middlewares/content-moderation.middleware';
import { InterpreteDreamRequestDto, ReinterpreteDreamRequestDto, SaveDreamNodeRequestDto } from "@infrastructure/dtos/dream-node";
import { GetUserNodesRequestDto } from "@infrastructure/dtos/dream-node/get-user-nodes.dto";
import { authenticateToken } from "@infrastructure/middlewares/auth.middleware";
import { DreamContextService } from "@application/services/dream-context.service";
import { IllustrationSkyboxProvider } from "@infrastructure/providers/illustration-skybox.provider";
import { IllustrationDreamService } from "@application/services/illustration-dream.service";
import { MissionService } from "@application/services/mission.service";
import { MissionRepositorySupabase } from "@infrastructure/repositories/mission.repository.supabase";
import { BadgeRepositorySupabase } from "@infrastructure/repositories/badge.repository.supabase";
import { validateAudio } from "@infrastructure/middlewares/upload";
import { TranscripcionController } from "@infrastructure/controllers/transcription.controller";
import { TranscriptionWhisperProvider } from "@infrastructure/providers/transcription-whisper.provider";
import { TranscriptionService } from "@application/services/transcription.service";
import { UpdateDreamNodeRequestDto } from "@infrastructure/dtos/dream-node/update-dream-node.dto";
import { MembershipRepositorySupabase } from "@infrastructure/repositories/membership.repository.supabase";
import { MembershipService } from "@application/services/membership.service";
import { EmotionRepositorySupabase } from "@/infrastructure/repositories/emotion.repository.supabase";
import { DreamTypeRepositorySupabase } from "@/infrastructure/repositories/dream-type.repository.supabase";
import { CoinRepositorySupabase } from "@infrastructure/repositories/coin.repository.supabase";
import { DreamNodeCommentController } from "@infrastructure/controllers/dream-node-comment.controller";
import { NotificationService } from "@/application/services/notification.service";
import { NotificationRepositorySupabase } from "@/infrastructure/repositories/notification.repository.supabase";
import { UserService } from "@/application/services/user.service";
import { UserRepositorySupabase } from "@/infrastructure/repositories/user.repository.supabase";
import { RoomRepositorySupabase } from "@/infrastructure/repositories/room.repository.supabase";
import { RoomService } from "@/application/services/room.service";
import { DreamNodeCommentService } from "@application/services/dream-node-comment.service";

export const dreamNodeRouter = Router();

const emotionRepository = new EmotionRepositorySupabase();
const dreamTypeRepository = new DreamTypeRepositorySupabase();
const interpretationProvider = new InterpretationOpenAIProvider(emotionRepository, dreamTypeRepository);
const interpretationDreamService = new InterpretationDreamService(interpretationProvider);
const illustrationProvider = new IllustrationSkyboxProvider();
const illustrationService = new IllustrationDreamService(illustrationProvider);
const dreamNodeRepository = new DreamNodeRepositorySupabase();
const missionRepository = new MissionRepositorySupabase();
const badgeRepository = new BadgeRepositorySupabase();
const membershipRepository = new MembershipRepositorySupabase();
const coinRepository = new CoinRepositorySupabase();
const membershipService = new MembershipService(membershipRepository);
const missionService = new MissionService(dreamNodeRepository, missionRepository, badgeRepository, coinRepository);
const dreamNodeService = new DreamNodeService(dreamNodeRepository, missionService);
const contextService = new DreamContextService(dreamNodeRepository);
const dreamNodeController = new DreamNodeController(interpretationDreamService, dreamNodeService, illustrationService, contextService, membershipService);
const transcriptionProvider = new TranscriptionWhisperProvider();
const transcriptionService = new TranscriptionService(transcriptionProvider);
const transcriptionController = new TranscripcionController(transcriptionService);
const notificationRepository = new NotificationRepositorySupabase()
const notificationService = new NotificationService(notificationRepository)
const userRepository = new UserRepositorySupabase()
const roomRepository = new RoomRepositorySupabase()
const roomService = new RoomService(roomRepository, coinRepository)
const userService = new UserService(userRepository, membershipService, roomService, coinRepository)
const dreamNodeCommentService = new DreamNodeCommentService();
const dreamNodeCommentController = new DreamNodeCommentController(userService, notificationService, dreamNodeService, dreamNodeCommentService);

// Endpoints de interpretación
dreamNodeRouter.post("/interpret", authenticateToken, validateBody(InterpreteDreamRequestDto), (req, res, next) => contentModerationMiddleware(req, res, next), (req, res) => dreamNodeController.interpret(req, res));
dreamNodeRouter.post("/illustrate", authenticateToken, validateBody(InterpreteDreamRequestDto), (req, res, next) => contentModerationMiddleware(req, res, next), (req, res) => dreamNodeController.illustrate(req, res));
dreamNodeRouter.post("/reinterpret", authenticateToken, validateBody(ReinterpreteDreamRequestDto), (req, res, next) => contentModerationMiddleware(req, res, next), (req, res) => dreamNodeController.reinterpret(req, res));
dreamNodeRouter.post("/save", authenticateToken, validateBody(SaveDreamNodeRequestDto), (req, res) => dreamNodeController.save(req, res));
dreamNodeRouter.post("/transcribe", authenticateToken, validateAudio, (req, res) => transcriptionController.transcribeAudio(req, res));
dreamNodeRouter.get("/history", authenticateToken, validateQuery(GetUserNodesRequestDto), (req, res) => dreamNodeController.getUserNodes(req, res));
dreamNodeRouter.get("/user", authenticateToken, (req, res) => dreamNodeController.showUser(req, res));
dreamNodeRouter.put("/update", authenticateToken, validateBody(UpdateDreamNodeRequestDto), (req, res) => dreamNodeController.update(req, res));
dreamNodeRouter.patch("/:id/share", authenticateToken, (req, res) => dreamNodeController.share(req, res));
dreamNodeRouter.patch("/:id/unshare", authenticateToken, (req, res) => dreamNodeController.unshare(req, res));
dreamNodeRouter.get("/public", (req, res) => dreamNodeController.getPublicDreams(req, res));
dreamNodeRouter.get("/:id/comments", (req, res) => dreamNodeCommentController.getCommentsWithUser(req, res));
dreamNodeRouter.get("/map", authenticateToken, (req, res) => dreamNodeController.getUserMap(req, res));
dreamNodeRouter.get("/stats", authenticateToken, (req, res) => dreamNodeController.getMyStats(req, res));
dreamNodeRouter.get("/:id", (req, res) => dreamNodeController.getById(req, res));
