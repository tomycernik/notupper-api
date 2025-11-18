
import { Request, Response } from "express";
import { DreamNodeCommentService } from "@application/services/dream-node-comment.service";
import { CreateDreamNodeCommentDto } from "@infrastructure/dtos/dream-node/create-dream-node-comment.dto";
import { DreamNodeService } from "@application/services/dream-node.service";
import { DreamNodeRepositorySupabase } from "@infrastructure/repositories/dream-node.repository.supabase";

const commentService = new DreamNodeCommentService();
const dreamNodeService = new DreamNodeService(new DreamNodeRepositorySupabase());

export class DreamNodeCommentController {
  async getComments(req: Request, res: Response) {
    try {
      const { nodeId } = req.params;
      if (!nodeId) return res.status(400).json({ success: false, message: "Falta nodeId" });
      const comments = await commentService.getCommentsByNodeWithUser(nodeId);
      res.json({ success: true, comments });
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
      const profileId = (req as any).userId;
      const { content } = req.body as CreateDreamNodeCommentDto;
      if (!nodeId || !profileId || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ success: false, message: "Faltan datos o el comentario es inválido" });
      }
      const newComment = await commentService.addComment(nodeId, profileId, content.trim());
      const comments = await commentService.getCommentsByNodeWithUser(nodeId);
      const commentWithUser = comments.find(c => c.id === newComment.id);
      res.status(201).json({ success: true, comment: commentWithUser || newComment });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al agregar comentario", error: error instanceof Error ? error.message : error });
    }
  }
}
