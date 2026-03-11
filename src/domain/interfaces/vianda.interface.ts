import { IComida } from './comida.interface';

export type ViandaTipo = 'COMUN' | 'VEGETARIANA';

export interface IVianda {
  id?: string;
  nombre: string;
  tipo: ViandaTipo;
  activo: boolean;
  observaciones?: string;
  created_at?: string;
}

export interface IViandaConComidas extends IVianda {
  comidas: IComida[];
}