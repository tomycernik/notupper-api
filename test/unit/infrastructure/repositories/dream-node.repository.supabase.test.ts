import 'reflect-metadata';
import { IDreamNode } from '../../../../src/domain/models/dream-node.model';

jest.doMock('../../../../src/config/envs', () => ({
  envs: {
    SUPABASE_URL: 'https://fake.supabase.co',
    SUPABASE_KEY: 'fake-key',
    SUPABASE_JWT_SECRET: 'secret',
    PORT: 3000,
    OPENAI_API_KEY: 'fake-key',
  },
}));

let DreamNodeRepositorySupabase: any;
let supabase: any;

describe('DreamNodeRepositorySupabase Integration Tests', () => {
  let repo: any;
  const dreamNodeMock: IDreamNode = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'My first dream in Oniria',
    creationDate: new Date(),
    dream_description: 'A dream description',
    interpretation: 'Some interpretation',
    privacy: 'Privado',
    state: 'Activo',
    emotion: 'Alegría',
    imageUrl: '',
    type: 'Estandar',
  };

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.doMock('../../../../src/config/envs', () => ({
      envs: {
        SUPABASE_URL: 'https://fake.supabase.co',
        SUPABASE_KEY: 'fake-key',
        SUPABASE_JWT_SECRET: 'secret',
        PORT: 3000,
        OPENAI_API_KEY: 'fake-key',
      },
    }));
    DreamNodeRepositorySupabase = (await import('../../../../src/infrastructure/repositories/dream-node.repository.supabase')).DreamNodeRepositorySupabase;
    supabase = (await import('../../../../src/config/supabase')).supabase;
    repo = new DreamNodeRepositorySupabase();
  });

  describe('save', () => {
    it('should insert a dream node correctly', async () => {
      const singleMock = jest.fn().mockResolvedValue({ data: dreamNodeMock, error: null });
      const selectMock = jest.fn(() => ({ single: singleMock }));
      const insertMock = jest.fn(() => ({ select: selectMock }));
      supabase.from = jest.fn().mockReturnValue({ insert: insertMock });
      const dreamType = 'Estandar';
      await repo.save(dreamNodeMock, 'user-1', dreamType);
      expect(supabase.from).toHaveBeenCalledWith('dream_node');
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'My first dream in Oniria',
      }));
      expect(selectMock).toHaveBeenCalled();
      expect(singleMock).toHaveBeenCalled();
    });

    it('should return error if Supabase returns error', async () => {
      const errorMessage = 'Insert error';
      const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: errorMessage } });
      const selectMock = jest.fn(() => ({ single: singleMock }));
      const insertMock = jest.fn(() => ({ select: selectMock }));
      supabase.from = jest.fn().mockReturnValue({ insert: insertMock });
      const dreamType = 'Estandar';
      const result = await repo.save(dreamNodeMock, 'user-1', dreamType);
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('getDreamsForFeed', () => {
  it('should query public and anonymous dreams with pagination', async () => {

    const rangeMock = jest.fn(() =>
      Promise.resolve({ data: [dreamNodeMock], error: null })
    );

    const orderMock = jest.fn(() => ({
      range: rangeMock
    }));

    const eqMock = jest.fn(() => ({
      order: orderMock
    }));

    const inMock = jest.fn(() => ({
      eq: eqMock
    }));

    const selectMock = jest.fn(() => ({
      in: inMock
    }));

    supabase.from = jest.fn().mockReturnValue({
      select: selectMock
    });

    supabase.auth = {
      admin: {
        getUserById: jest.fn().mockResolvedValue({
          data: {
            user: {
              user_metadata: {},
              email: 'test@example.com'
            }
          },
          error: null
        })
      }
    } as any;

    repo.countLikes = jest.fn().mockResolvedValue(3);
    repo.isLikedByUser = jest.fn().mockResolvedValue(false);

    const MockCommentRepo = jest.fn().mockImplementation(() => ({
      countComments: jest.fn().mockResolvedValue(0),
      getCommentsByNodeWithUser: jest.fn().mockResolvedValue([]),
      getCommentsByNode: jest.fn().mockResolvedValue([]),
      addComment: jest.fn(),
    }));

    jest
      .spyOn(
        await import('../../../../src/infrastructure/repositories/dream-node-comment.repository.supabase'),
        'DreamNodeCommentRepositorySupabase'
      )
      .mockImplementation(MockCommentRepo);

    const result = await repo.getDreamsForFeed({ offset: 0, limit: 1 });

    expect(supabase.from).toHaveBeenCalledWith('dream_node');
    expect(selectMock).toHaveBeenCalledWith(`*, emotion:emotion_id(id, emotion, color)`);
    expect(inMock).toHaveBeenCalledWith('privacy_id', expect.any(Array));
    expect(eqMock).toHaveBeenCalledWith('state_id', expect.any(String));
    expect(orderMock).toHaveBeenCalledWith('creation_date', { ascending: false });
    expect(rangeMock).toHaveBeenCalledWith(0, 0);
    expect(Array.isArray(result)).toBe(true);
  });
});

  describe('countPublicDreams', () => {
    it('should count only public dreams', async () => {
      const eqMock = jest.fn(() => Promise.resolve({ count: 5, error: null }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));
      supabase.from = jest.fn().mockReturnValue({ select: selectMock });
      const count = await repo.countPublicDreams();
      expect(supabase.from).toHaveBeenCalledWith('dream_node');
      expect(selectMock).toHaveBeenCalledWith("*", { count: "exact", head: true });
      expect(eqMock).toHaveBeenCalledWith('privacy_id', expect.any(String));
      expect(typeof count).toBe('number');
      expect(count).toBe(5);
    });
  });
});
