
import { supabase } from "@config/supabase";
import { IDreamNodeComment } from "@domain/interfaces/dream-node-comment.interface";

export class DreamNodeCommentRepositorySupabase {
  async getCommentsByNode(dreamNodeId: string): Promise<IDreamNodeComment[]> {
    const { data, error } = await supabase
      .from("dream_node_comment")
      .select("*")
      .eq("dream_node_id", dreamNodeId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async addComment(dreamNodeId: string, profileId: string, content: string): Promise<IDreamNodeComment> {
    const { data, error } = await supabase
      .from("dream_node_comment")
      .insert({ dream_node_id: dreamNodeId, profile_id: profileId, content })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async countComments(dreamNodeId: string): Promise<number> {
    const { count, error } = await supabase
      .from("dream_node_comment")
      .select("*", { count: "exact", head: true })
      .eq("dream_node_id", dreamNodeId);
    if (error) throw new Error(error.message);
    return count || 0;
  }
}
