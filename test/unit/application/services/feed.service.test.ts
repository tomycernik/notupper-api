import { FeedService } from '../../../../src/application/services/feed.service';

describe('FeedService', () => {
  let mockRepo: any;
  let service: FeedService;

  beforeEach(() => {
    mockRepo = {
      getDreamsForFeed: jest.fn(),
      countPublicDreams: jest.fn(),
      like: jest.fn(),
      unlike: jest.fn()
    };

    service = new FeedService(mockRepo);
  });

  it('getFeed should return paginated result', async () => {
    mockRepo.getDreamsForFeed.mockResolvedValueOnce([{ id: 'n1' }]);
    mockRepo.countPublicDreams.mockResolvedValueOnce(1);

    const result = await service.getFeed(undefined, 10, 0);

    expect(mockRepo.getDreamsForFeed).toHaveBeenCalledWith(
      { limit: 10, offset: 0 },
      undefined
    );
    expect(result).toEqual([{ id: 'n1' }]);
  });

  it('getFeed returns the correct number of nodes for limit and offset', async () => {
    mockRepo.getDreamsForFeed.mockResolvedValueOnce([
      { id: 'n1' }, { id: 'n2' }, { id: 'n3' }
    ]);
    const result = await service.getFeed(undefined, 3, 0);
    expect(result.length).toBe(3);
    expect(result[0].id).toBe('n1');
    expect(result[2].id).toBe('n3');
  });

  it('getFeed returns an empty array if there are no nodes', async () => {
    mockRepo.getDreamsForFeed.mockResolvedValueOnce([]);
    const result = await service.getFeed(undefined, 10, 0);
    expect(result).toEqual([]);
  });

  it('getFeed filters by user if profileId is provided', async () => {
    mockRepo.getDreamsForFeed.mockResolvedValueOnce([{ id: 'n1', user: 'u1' }]);
    const result = await service.getFeed('u1', 1, 0);
    expect(mockRepo.getDreamsForFeed).toHaveBeenCalledWith({ limit: 1, offset: 0 }, 'u1');
    expect(result[0].user).toBe('u1');
  });

  it('getFeed handles repository errors correctly', async () => {
    mockRepo.getDreamsForFeed.mockRejectedValueOnce(new Error('DB error'));
    await expect(service.getFeed(undefined, 10, 0)).rejects.toThrow('DB error');
  });

  it('likeNode should call repository like', async () => {
    await service.likeNode('node-1', 'user-1');
    expect(mockRepo.like).toHaveBeenCalledWith('node-1', 'user-1');
  });

  it('likeNode should throw if repository like fails', async () => {
    mockRepo.like.mockRejectedValueOnce(new Error('Like error'));
    await expect(service.likeNode('node-1', 'user-1')).rejects.toThrow('Like error');
  });

  it('unlikeNode should call repository unlike', async () => {
    await service.unlikeNode('node-1', 'user-1');
    expect(mockRepo.unlike).toHaveBeenCalledWith('node-1', 'user-1');
  });

  it('unlikeNode should throw if repository unlike fails', async () => {
    mockRepo.unlike.mockRejectedValueOnce(new Error('Unlike error'));
    await expect(service.unlikeNode('node-1', 'user-1')).rejects.toThrow('Unlike error');
  });
});