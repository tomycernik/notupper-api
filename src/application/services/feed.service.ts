import { IPaginationOptions, IPaginatedResult } from '@domain/interfaces/pagination.interface';
import { DreamNodeRepositorySupabase } from '@infrastructure/repositories/dream-node.repository.supabase';

export class FeedService {
  constructor(
    private readonly dreamNodeRepository = new DreamNodeRepositorySupabase(),
  ) {}

  async getFeed(pagination: IPaginationOptions, profileId?: string): Promise<IPaginatedResult<any>> {
    const data = await this.dreamNodeRepository.getPublicDreams(pagination);
    const nodesWithLikes = await Promise.all(
      data.map(async (node: any) => {
        const likeCount = await this.dreamNodeRepository.countLikes(node.id);
        let likedByMe = false;
        if (profileId) {
          likedByMe = await this.dreamNodeRepository.isLikedByUser(node.id, profileId);
        }
        return { ...node, likeCount, likedByMe };
      })
    );
    // Construir paginación manualmente
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const total = await this.dreamNodeRepository.countPublicDreams();
    const totalPages = Math.ceil(total / limit);
    const paginationMeta = {
      currentPage: page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
    return { data: nodesWithLikes, pagination: paginationMeta };
  }

  async likeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.like(dreamNodeId, profileId);
  }

  async unlikeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.unlike(dreamNodeId, profileId);
  }
}
