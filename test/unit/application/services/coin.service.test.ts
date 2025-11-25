import { CoinService } from '../../../../src/application/services/coin.service';
import { ICoinRepository } from '../../../../src/domain/repositories/coin.repository';

describe('CoinService', () => {
  let coinRepository: jest.Mocked<ICoinRepository>;
  let coinService: CoinService;

  beforeEach(() => {
    coinRepository = {
      getUserCoins: jest.fn(),
      addCoins: jest.fn(),
      deductCoins: jest.fn(),
      registerMovement: jest.fn(),
      getMovements: jest.fn()
    };
    coinService = new CoinService(coinRepository);
  });

  describe('registerMovement', () => {
    it('should throw error for invalid data', async () => {
      await expect(coinService.registerMovement('', 10, 'ingreso', 'desc')).rejects.toThrow('Datos inválidos');
      await expect(coinService.registerMovement('user', 'not-a-number' as any, 'ingreso', 'desc')).rejects.toThrow('Datos inválidos');
      await expect(coinService.registerMovement('user', 10, 'invalid' as any, 'desc')).rejects.toThrow('Datos inválidos');
      await expect(coinService.registerMovement('user', 10, 'ingreso', '')).rejects.toThrow('Datos inválidos');
    });

    it('should call repository and return success', async () => {
      coinRepository.registerMovement.mockResolvedValueOnce();
      const result = await coinService.registerMovement('user', 10, 'ingreso', 'desc');
      expect(coinRepository.registerMovement).toHaveBeenCalledWith('user', 10, 'ingreso', 'desc');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getMovements', () => {
    it('should throw error if userId is missing', async () => {
      await expect(coinService.getMovements('')).rejects.toThrow('Unauthorized');
    });

    it('should return movements and coins', async () => {
      coinRepository.getMovements.mockResolvedValueOnce([{ description: 'desc', value: 10, sign: '+', date: '2025-11-25', time: '10:00' }]);
      coinRepository.getUserCoins.mockResolvedValueOnce(100);
      const result = await coinService.getMovements('user');
      expect(result).toEqual({ movements: [{ description: 'desc', value: 10, sign: '+', date: '2025-11-25', time: '10:00' }], coins: 100 });
    });
  });
});
