import { IComida } from '@domain/interfaces/comida.interface';

export interface IComidaRepository {
  create(comida: IComida): Promise<IComida>;
  findAll(soloActivas?: boolean): Promise<IComida[]>;
  findById(id: string): Promise<IComida | null>;
  update(id: string, data: Partial<IComida>): Promise<IComida>;
  delete(id: string): Promise<void>;
  toggleActiva(id: string): Promise<IComida>;
}
