"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViandaController = void 0;
class ViandaController {
    constructor(viandaService) {
        this.viandaService = viandaService;
    }
    async crear(req, res) {
        try {
            const dto = req.body;
            const vianda = await this.viandaService.crear({ ...dto, activo: dto.activo ?? false });
            res.status(201).json({ success: true, data: vianda });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async obtenerTodas(req, res) {
        try {
            const soloActivas = req.query['soloActivas'] === 'true';
            const viandas = await this.viandaService.obtenerTodas(soloActivas);
            res.json({ success: true, data: viandas });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async obtenerPorId(req, res) {
        try {
            const id = req.params['id'];
            const vianda = await this.viandaService.obtenerPorId(id);
            res.json({ success: true, data: vianda });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
    async actualizar(req, res) {
        try {
            const id = req.params['id'];
            const vianda = await this.viandaService.actualizar(id, req.body);
            res.json({ success: true, data: vianda });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async eliminar(req, res) {
        try {
            const id = req.params['id'];
            await this.viandaService.eliminar(id);
            res.json({ success: true, message: 'Vianda eliminada' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async toggleActivo(req, res) {
        try {
            const id = req.params['id'];
            const vianda = await this.viandaService.toggleActivo(id);
            res.json({ success: true, data: vianda });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async asignarComidas(req, res) {
        try {
            const id = req.params['id'];
            const { comidas } = req.body;
            await this.viandaService.asignarComidas(id, comidas);
            res.json({ success: true, message: 'Comidas asignadas correctamente' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async quitarComida(req, res) {
        try {
            const id = req.params['id'];
            const comidaId = req.params['comidaId'];
            await this.viandaService.quitarComida(id, comidaId);
            res.json({ success: true, message: 'Comida quitada de la vianda' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.ViandaController = ViandaController;
//# sourceMappingURL=vianda.controller.js.map