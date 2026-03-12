import { IVianda, IViandaConComidas } from '@domain/interfaces/vianda.interface';
export interface IViandaRepository {
    create(vianda: IVianda): Promise<IVianda>;
    findAll(soloActivas?: boolean): Promise<IViandaConComidas[]>;
    findById(id: string): Promise<IViandaConComidas | null>;
    update(id: string, data: Partial<IVianda>): Promise<IVianda>;
    delete(id: string): Promise<void>;
    toggleActivo(id: string): Promise<IVianda>;
    asignarComidas(viandaId: string, comidaIds: {
        comidaId: string;
        orden?: number;
    }[]): Promise<void>;
    quitarComida(viandaId: string, comidaId: string): Promise<void>;
}
//# sourceMappingURL=vianda.repository.d.ts.map