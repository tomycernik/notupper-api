import { Request, Response } from 'express';
import { ICoinRepository } from '../../domain/repositories/coin.repository';

export class CoinController {
  constructor(private readonly coinRepository: ICoinRepository) {}

  async registerMovement(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { amount, type, description } = req.body;
      if (!userId || typeof amount !== 'number' || !['ingreso', 'egreso'].includes(type) || !description) {
        return res.status(400).json({ error: 'Datos inválidos' });
      }
      await this.coinRepository.registerMovement(userId, amount, type, description);
      res.json({ success: true });
    } catch (e: any) {
      console.error('CoinController registerMovement error:', e);
      res.status(500).json({ error: 'Error al registrar movimiento' });
    }
  }

  async getMovements(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const movements = await this.coinRepository.getMovements(userId);
      res.json({ movements });
    } catch (e: any) {
      console.error('CoinController getMovements error:', e);
      res.status(500).json({ error: 'Error al obtener movimientos' });
    }
  }
}
