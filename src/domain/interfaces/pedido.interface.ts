export type PedidoEstado = 'PENDIENTE' | 'EN_PROCESO' | 'ENTREGADO' | 'CANCELADO';
export type PedidoTamano = 'CHICA' | 'GRANDE';
export type ExtraTipo = 'empanada' | 'pizza';

export interface IPedidoExtra {
  id?: string;
  pedido_id?: string;
  tipo: ExtraTipo;
  sabor: string;
  cantidad: number;
}

export interface IPedido {
  id?: string;
  usuario_id: string;
  vianda_id: string;
  tamano: PedidoTamano;
  estado: PedidoEstado;
  observaciones?: string;
  created_at?: string;
}

export interface IPedidoDetalle extends IPedido {
  usuario?: {
    nombre: string;
    apellido: string;
    celular: string;
    zona: string;
  };
  vianda?: {
    nombre: string;
    tipo: string;
  };
  extras?: IPedidoExtra[];
}