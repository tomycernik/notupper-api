import { IPaginationOptions, IPaginatedResult } from '@domain/interfaces/pagination.interface';
import { IDreamNodeRepository } from '@domain/repositories/dream-node.repository';

export class FeedService {
  constructor(private readonly dreamNodeRepository: IDreamNodeRepository) { }

  async getFeed(
    pagination: IPaginationOptions,
    profileId?: string
  ): Promise<IPaginatedResult<any>> {

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;

    const data = await this.dreamNodeRepository.getPublicDreams(pagination, profileId);

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

    return { data, pagination: paginationMeta };
  }

  async likeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.like(dreamNodeId, profileId);
  }

  async unlikeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.unlike(dreamNodeId, profileId);
  }
}