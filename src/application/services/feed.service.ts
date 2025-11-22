// ...existing code...
import { IDreamNodeRepository } from '@domain/repositories/dream-node.repository';

export class FeedService {
  constructor(private readonly dreamNodeRepository: IDreamNodeRepository) { }

  async getFeed(profileId?: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    const options = { limit, offset };
    const data = await this.dreamNodeRepository.getPublicDreams(options, profileId);
    return data;
  }

  async likeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.like(dreamNodeId, profileId);
  }

  async unlikeNode(dreamNodeId: string, profileId: string): Promise<void> {
    await this.dreamNodeRepository.unlike(dreamNodeId, profileId);
  }
}