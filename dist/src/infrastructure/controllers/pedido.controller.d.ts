import { Request, Response } from 'express';
import { PedidoService } from '@application/services/pedido.service';
export declare class PedidoController {
    private readonly pedidoService;
    constructor(pedidoService: PedidoService);
    crear(req: Request, res: Response): Promise<void>;
    obtenerTodos(req: Request, res: Response): Promise<void>;
    obtenerMisPedidos(req: Request, res: Response): Promise<void>;
    obtenerPorId(req: Request, res: Response): Promise<void>;
    actualizarEstado(req: Request, res: Response): Promise<void>;
    cancelar(req: Request, res: Response): Promise<void>;
    eliminar(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=pedido.controller.d.ts.map