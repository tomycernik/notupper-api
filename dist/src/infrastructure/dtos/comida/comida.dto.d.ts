import type { ComidaTipo } from '@domain/interfaces/comida.interface';
export declare class CreateComidaDTO {
    nombre: string;
    descripcion?: string;
    tipo: ComidaTipo;
    activa?: boolean;
}
export declare class UpdateComidaDTO {
    nombre?: string;
    descripcion?: string;
    tipo?: ComidaTipo;
    activa?: boolean;
}
//# sourceMappingURL=comida.dto.d.ts.map