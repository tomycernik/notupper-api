import { DreamNodeCommentRepositorySupabase } from "@infrastructure/repositories/dream-node-comment.repository.supabase";
import { IDreamNodeCommentWithUser } from "@domain/interfaces/dream-node-comment.interface";

export class DreamNodeCommentService {
  private commentRepo = new DreamNodeCommentRepositorySupabase();

  //no se usa
  async getCommentsByNode(dreamNodeId: string) {
    return this.commentRepo.getCommentsByNode(dreamNodeId);
  }

  async getCommentsByNodeWithUser(dreamNodeId: string): Promise<IDreamNodeCommentWithUser[]> {
    return this.commentRepo.getCommentsByNodeWithUser(dreamNodeId);
  }

  //no se usa
  async addComment(dreamNodeId: string, profileId: string, content: string) {
    return this.commentRepo.addComment(dreamNodeId, profileId, content);
  }

  async addCommentWithUser(dreamNodeId: string, profileId: string, content: string) {
    const newComment = await this.commentRepo.addComment(dreamNodeId, profileId, content);
    let commentWithUser = null;
    //busca el comentario recien creado para mostrarlo con los demas comentarios y los datos del usuario
    try {
      const comments = await this.commentRepo.getCommentsByNodeWithUser(dreamNodeId);
      commentWithUser = comments.find(c => c.id === newComment.id) || null;
    } catch {
      // no-op
    }

    //si no encuentra el usuario, lo busca directo en supabase
    if (!commentWithUser) {
      let username = "Usuario desconocido";
      let avatar_url = "";
      try {
        const { data: userData, error: userError } = await (await import("@config/supabase")).supabase.auth.admin.getUserById(profileId);
        if (!userError && userData?.user) {
          username = userData.user.user_metadata?.username || "Usuario desconocido";
          avatar_url = userData.user.user_metadata?.avatar_url || "";
        }
      } catch {
        // no-op
      }
      commentWithUser = {
        ...newComment,
        user: { username, avatar_url }
      };
    }
    return commentWithUser;
  }

  async countComments(dreamNodeId: string) {
    return this.commentRepo.countComments(dreamNodeId);
  }
}
