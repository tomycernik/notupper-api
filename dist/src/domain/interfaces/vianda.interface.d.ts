import { IComida } from './comida.interface';
export type ViandaTipo = 'COMUN' | 'VEGETARIANA';
export type ViandaTamaño = 'CHICA' | 'GRANDE';
export interface IVianda {
    id?: string;
    nombre: string;
    tipo: ViandaTipo;
    tamano: ViandaTamaño;
    activo: boolean;
    observaciones?: string;
    created_at?: string;
}
export interface IViandaConComidas extends IVianda {
    comidas: IComida[];
}
//# sourceMappingURL=vianda.interface.d.ts.map