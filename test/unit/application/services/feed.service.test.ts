import { FeedService } from '../../../../src/application/services/feed.service';

describe('FeedService', () => {
  let mockRepo: any;
  let service: FeedService;

  beforeEach(() => {
    mockRepo = {
      getPublicDreams: jest.fn(),
      countPublicDreams: jest.fn(),
      like: jest.fn(),
      unlike: jest.fn()
    };

    service = new FeedService(mockRepo);
  });

  it('getFeed should return paginated result', async () => {
    mockRepo.getPublicDreams.mockResolvedValueOnce([{ id: 'n1' }]);
    mockRepo.countPublicDreams.mockResolvedValueOnce(1);

    const result = await service.getFeed({ page: 1, limit: 10 });

    expect(mockRepo.getPublicDreams).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      undefined
    );
    expect(result.data).toEqual([{ id: 'n1' }]);
    expect(result.pagination.total).toBe(1);
  });

  it('getFeed should handle repository error in getPublicDreams', async () => {
    mockRepo.getPublicDreams.mockRejectedValueOnce(new Error('DB error'));
    mockRepo.countPublicDreams.mockResolvedValueOnce(0);
    await expect(service.getFeed({ page: 1, limit: 10 })).rejects.toThrow('DB error');
  });

  it('getFeed should handle repository error in countPublicDreams', async () => {
    mockRepo.getPublicDreams.mockResolvedValueOnce([]);
    mockRepo.countPublicDreams.mockRejectedValueOnce(new Error('Count error'));
    await expect(service.getFeed({ page: 1, limit: 10 })).rejects.toThrow('Count error');
  });

  it('getFeed should return empty data if no dreams', async () => {
    mockRepo.getPublicDreams.mockResolvedValueOnce([]);
    mockRepo.countPublicDreams.mockResolvedValueOnce(0);
    const result = await service.getFeed({ page: 1, limit: 10 });
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
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