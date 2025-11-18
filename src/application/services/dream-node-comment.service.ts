// ...existing code...

import { DreamNodeCommentRepositorySupabase } from "@infrastructure/repositories/dream-node-comment.repository.supabase";
import { IDreamNodeCommentWithUser } from "@domain/interfaces/dream-node-comment.interface";

export class DreamNodeCommentService {
  private commentRepo = new DreamNodeCommentRepositorySupabase();

  async getCommentsByNode(dreamNodeId: string) {
    return this.commentRepo.getCommentsByNode(dreamNodeId);
  }

  async getCommentsByNodeWithUser(dreamNodeId: string): Promise<IDreamNodeCommentWithUser[]> {
    return this.commentRepo.getCommentsByNodeWithUser(dreamNodeId);
  }

  async addComment(dreamNodeId: string, profileId: string, content: string) {
    return this.commentRepo.addComment(dreamNodeId, profileId, content);
  }

  async addCommentWithUser(dreamNodeId: string, profileId: string, content: string) {
    const newComment = await this.commentRepo.addComment(dreamNodeId, profileId, content);
    let commentWithUser = null;
    try {
      const comments = await this.commentRepo.getCommentsByNodeWithUser(dreamNodeId);
      commentWithUser = comments.find(c => c.id === newComment.id) || null;
    } catch {
      // no-op
    }

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
