import 'reflect-metadata';

jest.doMock('../../../../src/config/envs', () => ({
  envs: {
    SUPABASE_URL: 'https://fake.supabase.co',
    SUPABASE_KEY: 'fake-key',
    SUPABASE_JWT_SECRET: 'secret',
    PORT: 3000,
    OPENAI_API_KEY: 'fake-key',
  },
}));

describe('CoinRepositorySupabase Integration Tests', () => {
  let repo: any;
  let supabase: any;
  const profileId = 'test-profile-id';

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

    const mod = await import('../../../../src/infrastructure/repositories/coin.repository.supabase');
    const supa = await import('../../../../src/config/supabase');
    repo = new mod.CoinRepositorySupabase();
    supabase = supa.supabase;
  });


  describe('getUserCoins', () => {
    it('should return the coin amount if found', async () => {
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { coin_amount: 42 }, error: null })
      });
      const coins = await repo.getUserCoins(profileId);
      expect(coins).toBe(42);
    });

    it('should handle supabase error', async () => {
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } })
      });
      await expect(repo.getUserCoins(profileId)).rejects.toThrow('fail');
    });

    it('should handle profile not found', async () => {
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null })
      });
      await expect(repo.getUserCoins(profileId)).rejects.toThrow('Profile not found');
    });
  });


  describe('addCoins', () => {
    it('should add coins successfully', async () => {
      supabase.rpc = jest.fn().mockResolvedValue({ error: null });
      await expect(repo.addCoins(profileId, 10)).resolves.toBeUndefined();
      expect(supabase.rpc).toHaveBeenCalledWith('add_coins', { profile_id: profileId, amount: 10 });
    });
    it('should handle supabase.rpc error', async () => {
      supabase.rpc = jest.fn().mockResolvedValue({ error: { message: 'rpc fail' } });
      await expect(repo.addCoins(profileId, 10)).rejects.toThrow('rpc fail');
    });
  });

  describe('deductCoins', () => {
    it('should deduct coins if there is enough balance', async () => {
      jest.spyOn(repo, 'getUserCoins').mockResolvedValue(20);
      supabase.rpc = jest.fn().mockResolvedValue({ error: null });
      await expect(repo.deductCoins(profileId, 10)).resolves.toBeUndefined();
      expect(repo.getUserCoins).toHaveBeenCalledWith(profileId);
      expect(supabase.rpc).toHaveBeenCalledWith('subtract_coins', { profile_id: profileId, amount: 10 });
    });
    it('should throw error if not enough balance', async () => {
      jest.spyOn(repo, 'getUserCoins').mockResolvedValue(5);
      await expect(repo.deductCoins(profileId, 10)).rejects.toThrow('Saldo insuficiente');
    });
    it('should handle supabase.rpc error', async () => {
      jest.spyOn(repo, 'getUserCoins').mockResolvedValue(20);
      supabase.rpc = jest.fn().mockResolvedValue({ error: { message: 'rpc fail' } });
      await expect(repo.deductCoins(profileId, 10)).rejects.toThrow('rpc fail');
    });
  });
});
