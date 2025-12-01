import { IDreamNodeRepository } from '@domain/repositories/dream-node.repository';

export class FeedService {
  constructor(private readonly dreamNodeRepository: IDreamNodeRepository) { }

  async getFeed(profileId?: string, limit?: number, offset?: number, userId?: string): Promise<any[]> {
    const options = {
      limit: limit ?? 20,
      offset: offset ?? 0
    };
    const data = await this.dreamNodeRepository.getDreamsForFeed(options, profileId, userId);
    return data;
  }

  async likeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.like(dreamNodeId, profileId);
  }

  async unlikeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.unlike(dreamNodeId, profileId);
  }
}