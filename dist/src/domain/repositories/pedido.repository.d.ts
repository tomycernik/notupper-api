import { IPedido, IPedidoDetalle, PedidoEstado } from '@domain/interfaces/pedido.interface';
export interface IPedidoRepository {
    create(pedido: IPedido): Promise<IPedido>;
    findAll(estado?: PedidoEstado): Promise<IPedidoDetalle[]>;
    findById(id: string): Promise<IPedidoDetalle | null>;
    findByUsuario(usuarioId: string): Promise<IPedidoDetalle[]>;
    updateEstado(id: string, estado: PedidoEstado): Promise<IPedido>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=pedido.repository.d.ts.map