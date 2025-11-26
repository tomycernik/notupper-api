import { Request, Response } from 'express';
import { CoinService } from '../../application/services/coin.service';
import { NotificationService } from '../../application/services/notification.service';
import { NotificationRepositorySupabase } from '../../infrastructure/repositories/notification.repository.supabase';

export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  async registerMovement(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { amount, type, description } = req.body;
      if (!userId || typeof amount !== 'number' || !['ingreso', 'egreso'].includes(type) || !description) {
        return res.status(400).json({ error: 'Datos inválidos' });
      }
      try {
        await this.coinService.registerMovement(userId, amount, type, description);
        res.json({ success: true });
      } catch (err: any) {
        if (err.message === 'Datos inválidos') {
          return res.status(400).json({ error: err.message });
        }
        throw err;
      }
    } catch (e: any) {
      console.error('CoinController registerMovement error:', e);
      res.status(500).json({ error: 'Error al registrar movimiento' });
    }
  }

  async getMovements(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      try {
        const result = await this.coinService.getMovements(userId);
        res.json(result);
      } catch (err: any) {
        if (err.message === 'Unauthorized') {
          return res.status(401).json({ error: err.message });
        }
        throw err;
      }
    } catch (e: any) {
      console.error('CoinController getMovements error:', e);
      res.status(500).json({ error: 'Error al obtener movimientos' });
    }
  }
}
