import { IPedidoRepository } from '@domain/repositories/pedido.repository';
import { IPedido, IPedidoDetalle, PedidoEstado } from '@domain/interfaces/pedido.interface';
export declare class PedidoRepositorySupabase implements IPedidoRepository {
    create(pedido: IPedido): Promise<IPedido>;
    findAll(estado?: PedidoEstado): Promise<IPedidoDetalle[]>;
    findById(id: string): Promise<IPedidoDetalle | null>;
    findByUsuario(usuarioId: string): Promise<IPedidoDetalle[]>;
    updateEstado(id: string, estado: PedidoEstado): Promise<IPedido>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=pedido.repository.supabase.d.ts.map