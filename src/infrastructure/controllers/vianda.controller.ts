import { Request, Response } from 'express';
import { ViandaService } from '@application/services/vianda.service';
import { CreateViandaDTO, UpdateViandaDTO, AsignarComidasDTO } from '@infrastructure/dtos/vianda/vianda.dto';

export class ViandaController {
  constructor(private readonly viandaService: ViandaService) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as CreateViandaDTO;
      const vianda = await this.viandaService.crear({ ...dto, activo: dto.activo ?? false });
      res.status(201).json({ success: true, data: vianda });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async obtenerTodas(req: Request, res: Response): Promise<void> {
    try {
      const soloActivas = req.query['soloActivas'] === 'true';
      const viandas = await this.viandaService.obtenerTodas(soloActivas);
      res.json({ success: true, data: viandas });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const vianda = await this.viandaService.obtenerPorId(id);
      res.json({ success: true, data: vianda });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const vianda = await this.viandaService.actualizar(id, req.body as UpdateViandaDTO);
      res.json({ success: true, data: vianda });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      await this.viandaService.eliminar(id);
      res.json({ success: true, message: 'Vianda eliminada' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleActivo(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const vianda = await this.viandaService.toggleActivo(id);
      res.json({ success: true, data: vianda });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async asignarComidas(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const { comidas } = req.body as AsignarComidasDTO;
      await this.viandaService.asignarComidas(id, comidas);
      res.json({ success: true, message: 'Comidas asignadas correctamente' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async quitarComida(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const comidaId = req.params['comidaId'] as string;
      await this.viandaService.quitarComida(id, comidaId);
      res.json({ success: true, message: 'Comida quitada de la vianda' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}