"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComidaService = void 0;
class ComidaService {
    constructor(comidaRepository) {
        this.comidaRepository = comidaRepository;
    }
    async crear(data) {
        return this.comidaRepository.create(data);
    }
    async obtenerTodas(soloActivas) {
        return this.comidaRepository.findAll(soloActivas);
    }
    async obtenerPorId(id) {
        const comida = await this.comidaRepository.findById(id);
        if (!comida)
            throw new Error('Comida no encontrada');
        return comida;
    }
    async actualizar(id, data) {
        await this.obtenerPorId(id);
        return this.comidaRepository.update(id, data);
    }
    async eliminar(id) {
        await this.obtenerPorId(id);
        return this.comidaRepository.delete(id);
    }
    async toggleActiva(id) {
        await this.obtenerPorId(id);
        return this.comidaRepository.toggleActiva(id);
    }
}
exports.ComidaService = ComidaService;
//# sourceMappingURL=comida.service.js.map