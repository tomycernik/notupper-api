import { Router } from 'express';
import { userRouter } from './modules/user.routes';
import { comidaRouter } from './modules/comida.routes';
import { viandaRouter } from './modules/vianda.routes';
import { pedidoRouter } from './modules/pedido.routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.get('/', (req, res) => res.json({ message: '🍱 NotTupper API', status: 'ok' }));

    router.use('/users', userRouter);
    router.use('/comidas', comidaRouter);
    router.use('/viandas', viandaRouter);
    router.use('/pedidos', pedidoRouter);

    return router;
  }
}
