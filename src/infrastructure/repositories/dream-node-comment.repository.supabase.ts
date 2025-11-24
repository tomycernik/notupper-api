import { supabase } from "@config/supabase";
import { IDreamNodeComment, IDreamNodeCommentWithUser } from "@domain/interfaces/dream-node-comment.interface";

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

  async getCommentsByNodeWithUser(dreamNodeId: string): Promise<IDreamNodeCommentWithUser[]> {
    const { data, error } = await supabase
      .from("dream_node_comment")
      .select("*")
      .eq("dream_node_id", dreamNodeId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    if (!data || data.length === 0) {
      return [];
    }

    const commentsWithUser = await Promise.all(
      data.map(async (comment) => {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(comment.profile_id);

        let username = "Usuario";
        let avatar_url = "";

        if (!userError && userData?.user) {
          username = userData.user.user_metadata?.username || (userData.user.email ? userData.user.email.split('@')[0] : "Usuario") || "Usuario";
          avatar_url = userData.user.user_metadata?.avatar_url || "";
        }

        //arma el array
        return {
          ...comment,
          user: {
            username,
            avatar_url,
          },
        };
      })
    );

    //este es el array final
    return commentsWithUser;
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
