import { Request, Response } from 'express';
import { ViandaService } from '@application/services/vianda.service';
export declare class ViandaController {
    private readonly viandaService;
    constructor(viandaService: ViandaService);
    crear(req: Request, res: Response): Promise<void>;
    obtenerTodas(req: Request, res: Response): Promise<void>;
    obtenerPorId(req: Request, res: Response): Promise<void>;
    actualizar(req: Request, res: Response): Promise<void>;
    eliminar(req: Request, res: Response): Promise<void>;
    toggleActivo(req: Request, res: Response): Promise<void>;
    asignarComidas(req: Request, res: Response): Promise<void>;
    quitarComida(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=vianda.controller.d.ts.map