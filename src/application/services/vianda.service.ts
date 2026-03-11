import { IViandaRepository } from '@domain/repositories/vianda.repository';
import { IVianda, IViandaConComidas } from '@domain/interfaces/vianda.interface';

export class ViandaService {
  constructor(private readonly viandaRepository: IViandaRepository) {}

  async crear(data: IVianda): Promise<IVianda> {
    return this.viandaRepository.create(data);
  }

  async obtenerTodas(soloActivas?: boolean): Promise<IViandaConComidas[]> {
    return this.viandaRepository.findAll(soloActivas);
  }

  async obtenerPorId(id: string): Promise<IViandaConComidas> {
    const vianda = await this.viandaRepository.findById(id);
    if (!vianda) throw new Error('Vianda no encontrada');
    return vianda;
  }

  async actualizar(id: string, data: Partial<IVianda>): Promise<IVianda> {
    await this.obtenerPorId(id);
    return this.viandaRepository.update(id, data);
  }

  async eliminar(id: string): Promise<void> {
    await this.obtenerPorId(id);
    return this.viandaRepository.delete(id);
  }

  async toggleActivo(id: string): Promise<IVianda> {
    await this.obtenerPorId(id);
    return this.viandaRepository.toggleActivo(id);
  }

  async asignarComidas(
    viandaId: string,
    comidas: { comidaId: string; orden?: number }[]
  ): Promise<void> {
    await this.obtenerPorId(viandaId);
    return this.viandaRepository.asignarComidas(viandaId, comidas);
  }

  async quitarComida(viandaId: string, comidaId: string): Promise<void> {
    await this.obtenerPorId(viandaId);
    return this.viandaRepository.quitarComida(viandaId, comidaId);
  }
}
