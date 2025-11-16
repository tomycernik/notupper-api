import { Request, Response } from "express";
import { DreamNodeCommentService } from "@application/services/dream-node-comment.service";
import { IDreamNodeComment } from "@domain/interfaces/dream-node-comment.interface";
import { CreateDreamNodeCommentDto } from "@infrastructure/dtos/dream-node/create-dream-node-comment.dto";

const commentService = new DreamNodeCommentService();

export class DreamNodeCommentController {
  async getComments(req: Request, res: Response) {
    try {
      const { nodeId } = req.params;
      if (!nodeId) return res.status(400).json({ success: false, message: "Falta nodeId" });
      const comments: IDreamNodeComment[] = await commentService.getCommentsByNode(nodeId);
      res.json({ success: true, comments });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener comentarios", error: error instanceof Error ? error.message : error });
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
      const comment: IDreamNodeComment = await commentService.addComment(nodeId, profileId, content.trim());
      res.status(201).json({ success: true, comment });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al agregar comentario", error: error instanceof Error ? error.message : error });
    }
  }
}
