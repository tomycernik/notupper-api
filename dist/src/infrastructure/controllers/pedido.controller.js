"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidoController = void 0;
class PedidoController {
    constructor(pedidoService) {
        this.pedidoService = pedidoService;
    }
    async crear(req, res) {
        try {
            const userId = req.userId;
            const { vianda_id, observaciones } = req.body;
            const pedido = await this.pedidoService.crear({
                usuario_id: userId,
                vianda_id,
                observaciones,
                estado: 'PENDIENTE',
            });
            res.status(201).json({ success: true, data: pedido });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async obtenerTodos(req, res) {
        try {
            const estado = req.query['estado'];
            const pedidos = await this.pedidoService.obtenerTodos(estado);
            res.json({ success: true, data: pedidos });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async obtenerMisPedidos(req, res) {
        try {
            const userId = req.userId;
            const pedidos = await this.pedidoService.obtenerPorUsuario(userId);
            res.json({ success: true, data: pedidos });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async obtenerPorId(req, res) {
        try {
            const id = req.params['id'];
            const pedido = await this.pedidoService.obtenerPorId(id);
            res.json({ success: true, data: pedido });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
    async actualizarEstado(req, res) {
        try {
            const id = req.params['id'];
            const { estado } = req.body;
            const pedido = await this.pedidoService.actualizarEstado(id, estado);
            res.json({ success: true, data: pedido });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async cancelar(req, res) {
        try {
            const id = req.params['id'];
            const pedido = await this.pedidoService.cancelar(id);
            res.json({ success: true, data: pedido });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async eliminar(req, res) {
        try {
            const id = req.params['id'];
            await this.pedidoService.eliminar(id);
            res.json({ success: true, message: 'Pedido eliminado' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.PedidoController = PedidoController;
//# sourceMappingURL=pedido.controller.js.map