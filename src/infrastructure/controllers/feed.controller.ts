import { Request, Response } from 'express';
import { FeedService } from '@application/services/feed.service';
import { UserService } from '@/application/services/user.service';
import { INotification } from '../../domain/models/notification.model';
import { NotificationService } from '@/application/services/notification.service';
import { DreamNodeService } from '@/application/services/dream-node.service';

export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly dreamNodeService: DreamNodeService
  ) { }

  async getFeed(req: Request, res: Response) {
    try {
      const pagination = req.query;
      const profileId = (req as any).userId || undefined;
      const feed = await this.feedService.getFeed(pagination, profileId);
      res.json(feed);
    } catch (error) {
      console.error("Error en FeedController getFeed:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener el feed",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  async likeNode(req: Request, res: Response) {
    try {
      const profileIdFrom = (req as any).userId;
      const { dreamNodeId } = req.body;
      if (!profileIdFrom || !dreamNodeId) {
        res.status(400).json({ success: false, message: "Faltan datos" });
        return;
      }
      await this.feedService.likeNode(dreamNodeId, profileIdFrom);
      const profileIdTo = await this.userService.getUserIdByDreamNodeId(dreamNodeId);
      const userNameFrom = await this.userService.getUserNameById(profileIdFrom)
      const avatar_url = await this.userService.getAvatarUrlById(profileIdFrom)
      const dreamNode = await this.dreamNodeService.getDreamNodeById(dreamNodeId)
      if (!dreamNode) {
        res.status(400).json({ success: false, message: "No existe Dream Node" });
        return;
      }
      const { title } = dreamNode
      const notification: INotification = {
        from_user: profileIdFrom,
        to_user: profileIdTo,
        title: "Tu publicación ha recibido un me gusta",
        message: userNameFrom + " le ha dado me gusta a tu nodo: " + title,
        delivered: false,
        read: false,
        metadata: {
          dreamNodeId: dreamNodeId,
          dreamNodeTitle: title,
          userNameFrom: userNameFrom,
          avatar_url: avatar_url
        },
        type: "like"
      }
      await this.notificationService.saveNotification(notification)
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error en FeedController likeNode:", error);
      res.status(500).json({ success: false, message: "Error al dar like" });
    }
  }

  async unlikeNode(req: Request, res: Response) {
    try {
      const profileId = (req as any).userId;
      const { dreamNodeId } = req.body;
      if (!profileId || !dreamNodeId) {
        res.status(400).json({ success: false, message: "Faltan datos" });
        return;
      }
      await this.feedService.unlikeNode(dreamNodeId, profileId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error en FeedController unlikeNode:", error);
      res.status(500).json({ success: false, message: "Error al quitar like" });
    }
  }
}