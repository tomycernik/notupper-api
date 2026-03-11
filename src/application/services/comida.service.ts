import { IComidaRepository } from '@domain/repositories/comida.repository';
import { IComida } from '@domain/interfaces/comida.interface';

export class ComidaService {
  constructor(private readonly comidaRepository: IComidaRepository) {}

  async crear(data: IComida): Promise<IComida> {
    return this.comidaRepository.create(data);
  }

  async obtenerTodas(soloActivas?: boolean): Promise<IComida[]> {
    return this.comidaRepository.findAll(soloActivas);
  }

  async obtenerPorId(id: string): Promise<IComida> {
    const comida = await this.comidaRepository.findById(id);
    if (!comida) throw new Error('Comida no encontrada');
    return comida;
  }

  async actualizar(id: string, data: Partial<IComida>): Promise<IComida> {
    await this.obtenerPorId(id);
    return this.comidaRepository.update(id, data);
  }

  async eliminar(id: string): Promise<void> {
    await this.obtenerPorId(id);
    return this.comidaRepository.delete(id);
  }

  async toggleActiva(id: string): Promise<IComida> {
    await this.obtenerPorId(id);
    return this.comidaRepository.toggleActiva(id);
  }
}
