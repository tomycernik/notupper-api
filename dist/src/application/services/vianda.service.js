"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViandaService = void 0;
class ViandaService {
    constructor(viandaRepository) {
        this.viandaRepository = viandaRepository;
    }
    async crear(data) {
        return this.viandaRepository.create(data);
    }
    async obtenerTodas(soloActivas) {
        return this.viandaRepository.findAll(soloActivas);
    }
    async obtenerPorId(id) {
        const vianda = await this.viandaRepository.findById(id);
        if (!vianda)
            throw new Error('Vianda no encontrada');
        return vianda;
    }
    async actualizar(id, data) {
        await this.obtenerPorId(id);
        return this.viandaRepository.update(id, data);
    }
    async eliminar(id) {
        await this.obtenerPorId(id);
        return this.viandaRepository.delete(id);
    }
    async toggleActivo(id) {
        await this.obtenerPorId(id);
        return this.viandaRepository.toggleActivo(id);
    }
    async asignarComidas(viandaId, comidas) {
        await this.obtenerPorId(viandaId);
        return this.viandaRepository.asignarComidas(viandaId, comidas);
    }
    async quitarComida(viandaId, comidaId) {
        await this.obtenerPorId(viandaId);
        return this.viandaRepository.quitarComida(viandaId, comidaId);
    }
}
exports.ViandaService = ViandaService;
//# sourceMappingURL=vianda.service.js.map