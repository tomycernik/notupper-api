import { Request, Response } from 'express';
import { ComidaService } from '@application/services/comida.service';
import { CreateComidaDTO, UpdateComidaDTO } from '@infrastructure/dtos/comida/comida.dto';

export class ComidaController {
  constructor(private readonly comidaService: ComidaService) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as CreateComidaDTO;
      const comida = await this.comidaService.crear({ ...dto, activa: dto.activa ?? true });
      res.status(201).json({ success: true, data: comida });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async obtenerTodas(req: Request, res: Response): Promise<void> {
    try {
      const soloActivas = req.query['soloActivas'] === 'true';
      const comidas = await this.comidaService.obtenerTodas(soloActivas);
      res.json({ success: true, data: comidas });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const comida = await this.comidaService.obtenerPorId(id);
      res.json({ success: true, data: comida });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const comida = await this.comidaService.actualizar(id, req.body as UpdateComidaDTO);
      res.json({ success: true, data: comida });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      await this.comidaService.eliminar(id);
      res.json({ success: true, message: 'Comida eliminada' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleActiva(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const comida = await this.comidaService.toggleActiva(id);
      res.json({ success: true, data: comida });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}