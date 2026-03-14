import { Request, Response } from 'express';
import { PedidoService } from '@application/services/pedido.service';
import { CreatePedidoDTO, UpdateEstadoDTO } from '@infrastructure/dtos/pedido/pedido.dto';
import { PedidoEstado } from '@domain/interfaces/pedido.interface';

export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId as string;
      const { vianda_id, tamano, observaciones, extras } = req.body as CreatePedidoDTO;

      if (!vianda_id && (!extras || extras.length === 0)) {
        res.status(400).json({ success: false, message: 'Debe incluir una vianda o extras' });
        return;
      }

      const pedidoData: any = {
        usuario_id: userId,
        tamano: tamano ?? 'CHICA',
        observaciones,
        estado: 'PENDIENTE',
      };
      if (vianda_id) pedidoData.vianda_id = vianda_id;

      const pedido = await this.pedidoService.crear(pedidoData, extras);
      res.status(201).json({ success: true, data: pedido });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const estado = req.query['estado'] as PedidoEstado | undefined;
      const pedidos = await this.pedidoService.obtenerTodos(estado);
      res.json({ success: true, data: pedidos });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async obtenerMisPedidos(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId as string;
      const pedidos = await this.pedidoService.obtenerPorUsuario(userId);
      res.json({ success: true, data: pedidos });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const pedido = await this.pedidoService.obtenerPorId(id);
      res.json({ success: true, data: pedido });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async actualizarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const { estado } = req.body as UpdateEstadoDTO;
      const pedido = await this.pedidoService.actualizarEstado(id, estado);
      res.json({ success: true, data: pedido });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async cancelar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const pedido = await this.pedidoService.cancelar(id);
      res.json({ success: true, data: pedido });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      await this.pedidoService.eliminar(id);
      res.json({ success: true, message: 'Pedido eliminado' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}