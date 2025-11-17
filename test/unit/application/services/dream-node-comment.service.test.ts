import { DreamNodeCommentService } from '../../../../src/application/services/dream-node-comment.service';
import { DreamNodeCommentRepositorySupabase } from '../../../../src/infrastructure/repositories/dream-node-comment.repository.supabase';
import { IDreamNodeCommentWithUser } from '../../../../src/domain/interfaces/dream-node-comment.interface';

jest.mock('../../../../src/config/envs', () => ({
  envs: {
    SUPABASE_URL: 'https://mock.supabase.co',
    SUPABASE_KEY: 'mock-key',
    SUPABASE_ANON_KEY: 'mock-anon-key',
    SUPABASE_SERVICE_KEY: 'mock-service-key',
  },
}));

jest.mock('../../../../src/infrastructure/repositories/dream-node-comment.repository.supabase');

describe('DreamNodeCommentService - getCommentsByNodeWithUser', () => {
  let service: DreamNodeCommentService;
  let mockRepository: jest.Mocked<DreamNodeCommentRepositorySupabase>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = new DreamNodeCommentRepositorySupabase() as jest.Mocked<DreamNodeCommentRepositorySupabase>;
    service = new DreamNodeCommentService();
    (service as any).commentRepo = mockRepository;
  });

  describe('getCommentsByNodeWithUser', () => {
    it('should return comments with user data', async () => {
      const mockDreamNodeId = '123e4567-e89b-12d3-a456-426614174000';
      const mockComments: IDreamNodeCommentWithUser[] = [
        {
          id: 'comment-1',
          dream_node_id: mockDreamNodeId,
          profile_id: 'user-1',
          content: 'Amazing dream!',
          created_at: '2025-11-16T10:00:00Z',
          user: {
            username: 'testuser',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      ];

      mockRepository.getCommentsByNodeWithUser = jest.fn().mockResolvedValue(mockComments);

      const result = await service.getCommentsByNodeWithUser(mockDreamNodeId);

      expect(result).toEqual(mockComments);
      expect(mockRepository.getCommentsByNodeWithUser).toHaveBeenCalledWith(mockDreamNodeId);
      expect(mockRepository.getCommentsByNodeWithUser).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when there are no comments', async () => {
      const mockDreamNodeId = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.getCommentsByNodeWithUser = jest.fn().mockResolvedValue([]);

      const result = await service.getCommentsByNodeWithUser(mockDreamNodeId);

      expect(result).toEqual([]);
      expect(mockRepository.getCommentsByNodeWithUser).toHaveBeenCalledWith(mockDreamNodeId);
    });

    it('should propagate errors from repository', async () => {
      const mockDreamNodeId = '123e4567-e89b-12d3-a456-426614174000';
      const mockError = new Error('Database connection failed');

      mockRepository.getCommentsByNodeWithUser = jest.fn().mockRejectedValue(mockError);

      await expect(service.getCommentsByNodeWithUser(mockDreamNodeId)).rejects.toThrow('Database connection failed');
      expect(mockRepository.getCommentsByNodeWithUser).toHaveBeenCalledWith(mockDreamNodeId);
    });
  });

  describe('countComments', () => {
    it('should return the correct count of comments', async () => {
      const mockDreamNodeId = '123e4567-e89b-12d3-a456-426614174000';
      mockRepository.countComments = jest.fn().mockResolvedValue(5);

      const result = await service.countComments(mockDreamNodeId);

      expect(result).toBe(5);
      expect(mockRepository.countComments).toHaveBeenCalledWith(mockDreamNodeId);
    });

    it('should return 0 when there are no comments', async () => {
      const mockDreamNodeId = '123e4567-e89b-12d3-a456-426614174000';
      mockRepository.countComments = jest.fn().mockResolvedValue(0);

      const result = await service.countComments(mockDreamNodeId);

      expect(result).toBe(0);
      expect(mockRepository.countComments).toHaveBeenCalledWith(mockDreamNodeId);
    });
  });
});
