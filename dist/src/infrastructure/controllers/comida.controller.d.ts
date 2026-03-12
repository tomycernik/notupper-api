import { Request, Response } from 'express';
import { ComidaService } from '@application/services/comida.service';
export declare class ComidaController {
    private readonly comidaService;
    constructor(comidaService: ComidaService);
    crear(req: Request, res: Response): Promise<void>;
    obtenerTodas(req: Request, res: Response): Promise<void>;
    obtenerPorId(req: Request, res: Response): Promise<void>;
    actualizar(req: Request, res: Response): Promise<void>;
    eliminar(req: Request, res: Response): Promise<void>;
    toggleActiva(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=comida.controller.d.ts.map