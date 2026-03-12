"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidoService = void 0;
class PedidoService {
    constructor(pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }
    async crear(data) {
        return this.pedidoRepository.create({
            ...data,
            estado: 'PENDIENTE',
        });
    }
    async obtenerTodos(estado) {
        return this.pedidoRepository.findAll(estado);
    }
    async obtenerPorId(id) {
        const pedido = await this.pedidoRepository.findById(id);
        if (!pedido)
            throw new Error('Pedido no encontrado');
        return pedido;
    }
    async obtenerPorUsuario(usuarioId) {
        return this.pedidoRepository.findByUsuario(usuarioId);
    }
    async actualizarEstado(id, estado) {
        await this.obtenerPorId(id);
        return this.pedidoRepository.updateEstado(id, estado);
    }
    async cancelar(id) {
        return this.actualizarEstado(id, 'CANCELADO');
    }
    async eliminar(id) {
        await this.obtenerPorId(id);
        return this.pedidoRepository.delete(id);
    }
}
exports.PedidoService = PedidoService;
//# sourceMappingURL=pedido.service.js.map