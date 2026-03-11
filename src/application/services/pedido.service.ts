import { IPedidoRepository } from '@domain/repositories/pedido.repository';
import { IPedido, IPedidoDetalle, PedidoEstado } from '@domain/interfaces/pedido.interface';

export class PedidoService {
  constructor(private readonly pedidoRepository: IPedidoRepository) {}

  async crear(data: IPedido): Promise<IPedido> {
    return this.pedidoRepository.create({
      ...data,
      estado: 'PENDIENTE',
    });
  }

  async obtenerTodos(estado?: PedidoEstado): Promise<IPedidoDetalle[]> {
    return this.pedidoRepository.findAll(estado);
  }

  async obtenerPorId(id: string): Promise<IPedidoDetalle> {
    const pedido = await this.pedidoRepository.findById(id);
    if (!pedido) throw new Error('Pedido no encontrado');
    return pedido;
  }

  async obtenerPorUsuario(usuarioId: string): Promise<IPedidoDetalle[]> {
    return this.pedidoRepository.findByUsuario(usuarioId);
  }

  async actualizarEstado(id: string, estado: PedidoEstado): Promise<IPedido> {
    await this.obtenerPorId(id);
    return this.pedidoRepository.updateEstado(id, estado);
  }

  async cancelar(id: string): Promise<IPedido> {
    return this.actualizarEstado(id, 'CANCELADO');
  }

  async eliminar(id: string): Promise<void> {
    await this.obtenerPorId(id);
    return this.pedidoRepository.delete(id);
  }
}
