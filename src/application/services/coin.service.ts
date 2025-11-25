import { ICoinRepository } from '../../domain/repositories/coin.repository';

export class CoinService {
  public readonly coinRepository: ICoinRepository;
  constructor(coinRepository: ICoinRepository) {
    this.coinRepository = coinRepository;
  }

  async registerMovement(
    userId: string,
    amount: number,
    type: 'ingreso' | 'egreso',
    description: string
  ) {
    if (!userId || typeof amount !== 'number' || !['ingreso', 'egreso'].includes(type) || !description) {
      throw new Error('Datos inválidos');
    }
    await this.coinRepository.registerMovement(userId, amount, type, description);
    return { success: true };
  }

  async getMovements(userId: string) {
    if (!userId) throw new Error('Unauthorized');
    const [movements, coins] = await Promise.all([
      this.coinRepository.getMovements(userId),
      this.coinRepository.getUserCoins(userId)
    ]);
    return { movements, coins };
  }
}
