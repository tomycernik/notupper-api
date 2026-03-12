import { IViandaRepository } from '@domain/repositories/vianda.repository';
import { IVianda, IViandaConComidas } from '@domain/interfaces/vianda.interface';
export declare class ViandaService {
    private readonly viandaRepository;
    constructor(viandaRepository: IViandaRepository);
    crear(data: IVianda): Promise<IVianda>;
    obtenerTodas(soloActivas?: boolean): Promise<IViandaConComidas[]>;
    obtenerPorId(id: string): Promise<IViandaConComidas>;
    actualizar(id: string, data: Partial<IVianda>): Promise<IVianda>;
    eliminar(id: string): Promise<void>;
    toggleActivo(id: string): Promise<IVianda>;
    asignarComidas(viandaId: string, comidas: {
        comidaId: string;
        orden?: number;
    }[]): Promise<void>;
    quitarComida(viandaId: string, comidaId: string): Promise<void>;
}
//# sourceMappingURL=vianda.service.d.ts.map