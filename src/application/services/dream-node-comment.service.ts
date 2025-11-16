import { DreamNodeCommentRepositorySupabase } from "@infrastructure/repositories/dream-node-comment.repository.supabase";

export class DreamNodeCommentService {
  private commentRepo = new DreamNodeCommentRepositorySupabase();

  async getCommentsByNode(dreamNodeId: string) {
    return this.commentRepo.getCommentsByNode(dreamNodeId);
  }

  async addComment(dreamNodeId: string, profileId: string, content: string) {
    return this.commentRepo.addComment(dreamNodeId, profileId, content);
  }

  async countComments(dreamNodeId: string) {
    return this.commentRepo.countComments(dreamNodeId);
  }
}
