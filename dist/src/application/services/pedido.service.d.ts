import { IPedidoRepository } from '@domain/repositories/pedido.repository';
import { IPedido, IPedidoDetalle, PedidoEstado } from '@domain/interfaces/pedido.interface';
export declare class PedidoService {
    private readonly pedidoRepository;
    constructor(pedidoRepository: IPedidoRepository);
    crear(data: IPedido): Promise<IPedido>;
    obtenerTodos(estado?: PedidoEstado): Promise<IPedidoDetalle[]>;
    obtenerPorId(id: string): Promise<IPedidoDetalle>;
    obtenerPorUsuario(usuarioId: string): Promise<IPedidoDetalle[]>;
    actualizarEstado(id: string, estado: PedidoEstado): Promise<IPedido>;
    cancelar(id: string): Promise<IPedido>;
    eliminar(id: string): Promise<void>;
}
//# sourceMappingURL=pedido.service.d.ts.map