import { Router } from "express";
import { dreamNodeRouter } from "@infrastructure/routes/modules/dream-node.routes";
import { badgeRouter } from "@infrastructure/routes/modules/badge.routes";
import { userRouter } from "@infrastructure/routes/modules/user.routes";
import { missionRouter } from "@infrastructure/routes/modules/mission.routes";
import { feedRouter } from "@infrastructure/routes/modules/feed.routes";
import { statisticsRouter } from "@infrastructure/routes/modules/statistics.routes";
import { roomRouter } from "@infrastructure/routes/modules/room.routes";
import { skinRouter } from "@infrastructure/routes/modules/skin.routes";
import { packageRouter } from "./modules/package.routes";
import { paymentRouter } from "./modules/payment.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.get("/", (req, res) => res.send("Oniria API"));
    router.use("/api/dreams", dreamNodeRouter);
    router.use("/api/badges", badgeRouter);
    router.use("/api/missions", missionRouter);
    router.use("/api/users", userRouter);
    router.use("/api/statistics", statisticsRouter);
    router.use("/api/rooms", roomRouter);
    router.use("/api/skins", skinRouter);
    router.use("/api/feed", feedRouter);
    router.use("/api/packages", packageRouter);
    router.use("/api/payments", paymentRouter);
    return router;
  }
}