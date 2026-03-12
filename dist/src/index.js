"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const envs_1 = require("@config/envs");
const router_1 = require("@infrastructure/routes/router");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', router_1.AppRoutes.routes);
app.listen(envs_1.envs.PORT, () => {
    console.log(`🚀 NotTupper API corriendo en puerto ${envs_1.envs.PORT}`);
});
//# sourceMappingURL=index.js.map