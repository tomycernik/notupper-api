import { IComidaRepository } from '@domain/repositories/comida.repository';
import { IComida } from '@domain/interfaces/comida.interface';
export declare class ComidaService {
    private readonly comidaRepository;
    constructor(comidaRepository: IComidaRepository);
    crear(data: IComida): Promise<IComida>;
    obtenerTodas(soloActivas?: boolean): Promise<IComida[]>;
    obtenerPorId(id: string): Promise<IComida>;
    actualizar(id: string, data: Partial<IComida>): Promise<IComida>;
    eliminar(id: string): Promise<void>;
    toggleActiva(id: string): Promise<IComida>;
}
//# sourceMappingURL=comida.service.d.ts.map