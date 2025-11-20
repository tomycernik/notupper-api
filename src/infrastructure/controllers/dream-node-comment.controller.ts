
import { Request, Response } from "express";
import { DreamNodeCommentService } from "@application/services/dream-node-comment.service";
import { CreateDreamNodeCommentDto } from "@infrastructure/dtos/dream-node/create-dream-node-comment.dto";
import { DreamNodeService } from "@application/services/dream-node.service";
import { DreamNodeRepositorySupabase } from "@infrastructure/repositories/dream-node.repository.supabase";
import { UserService } from "@/application/services/user.service";
import { INotification } from "@/domain/models/notification.model";
import { NotificationService } from "@/application/services/notification.service";

const commentService = new DreamNodeCommentService();
const dreamNodeService = new DreamNodeService(new DreamNodeRepositorySupabase());

export class DreamNodeCommentController {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly dreamNodeService: DreamNodeService
  ){}
  async getComments(req: Request, res: Response) {
    try {
      const { nodeId } = req.params;
      if (!nodeId) return res.status(400).json({ success: false, message: "Falta nodeId" });
      const currentUserId = (req as any).userId;
      const comments = await commentService.getCommentsByNodeWithUser(nodeId);

      const dreamNodeRepository = new DreamNodeRepositorySupabase();
      const likeCount = await dreamNodeRepository.countLikes(nodeId);
      const likedByMe = currentUserId ? await dreamNodeRepository.isLikedByUser(nodeId, currentUserId) : false;

      res.json({
        success: true,
        comments,
        node: {
          likeCount,
          likedByMe
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener comentarios", error: error instanceof Error ? error.message : error });
    }
  }

  async getCommentsWithUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Falta el ID del sueño"
        });
      }

      const dreamNode = await dreamNodeService.getDreamNodeById(id);

      if (!dreamNode) {
        return res.status(404).json({
          success: false,
          message: "Sueño no encontrado"
        });
      }

      if (dreamNode.privacy !== "Publico") {
        return res.status(403).json({
          success: false,
          message: "Este sueño no es público. Los comentarios solo están disponibles para sueños públicos."
        });
      }

      const comments = await commentService.getCommentsByNodeWithUser(id);
      const totalComments = await commentService.countComments(id);

      res.json({
        success: true,
        data: {
          comments,
          total: totalComments
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener comentarios",
        error: error instanceof Error ? error.message : error
      });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const { nodeId } = req.params;
      const profileIdFrom = (req as any).userId;
      const { content } = req.body as CreateDreamNodeCommentDto;
      if (!nodeId|| !profileIdFrom || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ success: false, message: "Faltan datos o el comentario es inválido" });
      }
      const commentWithUser = await commentService.addCommentWithUser(nodeId, profileIdFrom, content.trim());
      const profileIdTo = await this.userService.getUserIdByDreamNodeId(nodeId);
      const userNameFrom = await this.userService.getUserNameById(profileIdFrom)
      const avatar_url = await this.userService.getAvatarUrlById(profileIdFrom)
      const dreamNode = await this.dreamNodeService.getDreamNodeById(nodeId)
      if(!dreamNode){
         res.status(400).json({ success: false, message: "No existe Dream Node" });
        return;
      }
      const {title} = dreamNode
      const notification: INotification = {
              from_user: profileIdFrom,
              to_user: profileIdTo,
              title: "Tu publicación ha recibido un comentario",
              message: userNameFrom + " ha comentado tu nodo: " + title,
              delivered: false,
              read: false,
              metadata: {
                dreamNodeId: nodeId,
                dreamNodeTitle: title,
                userNameFrom: userNameFrom,
                avatar_url: avatar_url
              },
              type: "comment"
            }
      await this.notificationService.saveNotification(notification)
      res.status(201).json({ success: true, comment: commentWithUser });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al agregar comentario", error: error instanceof Error ? error.message : error });
    }
  }
}
