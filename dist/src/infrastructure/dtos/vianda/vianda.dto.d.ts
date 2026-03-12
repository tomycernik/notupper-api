import type { ViandaTipo, ViandaTamaño } from '@domain/interfaces/vianda.interface';
export declare class CreateViandaDTO {
    nombre: string;
    tipo: ViandaTipo;
    tamano: ViandaTamaño;
    activo?: boolean;
    observaciones?: string;
}
export declare class UpdateViandaDTO {
    nombre?: string;
    tipo?: ViandaTipo;
    tamano?: ViandaTamaño;
    activo?: boolean;
    observaciones?: string;
}
declare class ComidaOrdenDTO {
    comidaId: string;
    orden?: number;
}
export declare class AsignarComidasDTO {
    comidas: ComidaOrdenDTO[];
}
export {};
//# sourceMappingURL=vianda.dto.d.ts.map