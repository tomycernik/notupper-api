import { IPaginationOptions, IPaginatedResult } from '@domain/interfaces/pagination.interface';
import { DreamNodeRepositorySupabase } from '@infrastructure/repositories/dream-node.repository.supabase';

export class FeedService {
  constructor(
    private readonly dreamNodeRepository = new DreamNodeRepositorySupabase(),
  ) {}

  async getFeed(pagination: IPaginationOptions, profileId?: string): Promise<IPaginatedResult<any>> {
    const nodes = await this.dreamNodeRepository.getPublicNodes(pagination);
    const nodesWithLikes = await Promise.all(
      nodes.data.map(async (node: any) => {
        const likeCount = await this.dreamNodeRepository.countLikes(node.id);
        let likedByMe = false;
        if (profileId) {
          likedByMe = await this.dreamNodeRepository.isLikedByUser(node.id, profileId);
        }
        return { ...node, likeCount, likedByMe };
      }),
    );
    return { ...nodes, data: nodesWithLikes };
  }

  async likeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.like(dreamNodeId, profileId);
  }

  async unlikeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.unlike(dreamNodeId, profileId);
  }
}
