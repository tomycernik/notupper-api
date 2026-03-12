import { IComidaRepository } from '@domain/repositories/comida.repository';
import { IComida } from '@domain/interfaces/comida.interface';
export declare class ComidaRepositorySupabase implements IComidaRepository {
    create(comida: IComida): Promise<IComida>;
    findAll(soloActivas?: boolean): Promise<IComida[]>;
    findById(id: string): Promise<IComida | null>;
    update(id: string, data: Partial<IComida>): Promise<IComida>;
    delete(id: string): Promise<void>;
    toggleActiva(id: string): Promise<IComida>;
}
//# sourceMappingURL=comida.repository.supabase.d.ts.map