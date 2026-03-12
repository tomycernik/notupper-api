"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const express_1 = require("express");
const user_routes_1 = require("./modules/user.routes");
const comida_routes_1 = require("./modules/comida.routes");
const vianda_routes_1 = require("./modules/vianda.routes");
const pedido_routes_1 = require("./modules/pedido.routes");
class AppRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        router.get('/', (req, res) => res.json({ message: '🍱 NotTupper API', status: 'ok' }));
        router.use('/users', user_routes_1.userRouter);
        router.use('/comidas', comida_routes_1.comidaRouter);
        router.use('/viandas', vianda_routes_1.viandaRouter);
        router.use('/pedidos', pedido_routes_1.pedidoRouter);
        return router;
    }
}
exports.AppRoutes = AppRoutes;
//# sourceMappingURL=router.js.map