export type ComidaTipo = 'COMUN' | 'VEGETARIANA' | 'AMBAS';

export interface IComida {
  id?: string;
  nombre: string;
  descripcion?: string;
  tipo: ComidaTipo;
  activa: boolean;
  created_at?: string;
}
