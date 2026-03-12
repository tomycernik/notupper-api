"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComidaController = void 0;
class ComidaController {
    constructor(comidaService) {
        this.comidaService = comidaService;
    }
    async crear(req, res) {
        try {
            const dto = req.body;
            const comida = await this.comidaService.crear({ ...dto, activa: dto.activa ?? true });
            res.status(201).json({ success: true, data: comida });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async obtenerTodas(req, res) {
        try {
            const soloActivas = req.query['soloActivas'] === 'true';
            const comidas = await this.comidaService.obtenerTodas(soloActivas);
            res.json({ success: true, data: comidas });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    async obtenerPorId(req, res) {
        try {
            const id = req.params['id'];
            const comida = await this.comidaService.obtenerPorId(id);
            res.json({ success: true, data: comida });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
    async actualizar(req, res) {
        try {
            const id = req.params['id'];
            const comida = await this.comidaService.actualizar(id, req.body);
            res.json({ success: true, data: comida });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async eliminar(req, res) {
        try {
            const id = req.params['id'];
            await this.comidaService.eliminar(id);
            res.json({ success: true, message: 'Comida eliminada' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async toggleActiva(req, res) {
        try {
            const id = req.params['id'];
            const comida = await this.comidaService.toggleActiva(id);
            res.json({ success: true, data: comida });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.ComidaController = ComidaController;
//# sourceMappingURL=comida.controller.js.map