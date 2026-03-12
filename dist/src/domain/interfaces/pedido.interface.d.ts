export type PedidoEstado = 'PENDIENTE' | 'EN_PROCESO' | 'ENTREGADO' | 'CANCELADO';
export interface IPedido {
    id?: string;
    usuario_id: string;
    vianda_id: string;
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
        tamano: string;
    };
}
//# sourceMappingURL=pedido.interface.d.ts.map