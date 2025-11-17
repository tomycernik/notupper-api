export interface IDreamNodeComment {
  id: string;
  dream_node_id: string;
  profile_id: string;
  content: string;
  created_at: string;
}

export interface IDreamNodeCommentWithUser {
  id: string;
  dream_node_id: string;
  profile_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}