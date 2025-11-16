import { Request, Response } from 'express';
import { FeedService } from '@application/services/feed.service';

export class FeedController {
  constructor(private readonly feedService: FeedService) {}

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
      const profileId = (req as any).userId;
      const { dreamNodeId } = req.body;
      if (!profileId || !dreamNodeId) {
        res.status(400).json({ success: false, message: "Faltan datos" });
        return;
      }
      await this.feedService.likeNode(dreamNodeId, profileId);
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
