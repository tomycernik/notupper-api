"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envs = void 0;
const env_var_1 = require("env-var");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.envs = {
    PORT: (0, env_var_1.get)('PORT').default('3000').asPortNumber(),
    NODE_ENV: (0, env_var_1.get)('NODE_ENV').default('development').asString(),
    SUPABASE_URL: (0, env_var_1.get)('SUPABASE_URL').required().asString(),
    SUPABASE_SERVICE_ROLE_KEY: (0, env_var_1.get)('SUPABASE_SERVICE_ROLE_KEY').required().asString(),
    JWT_SECRET: (0, env_var_1.get)('JWT_SECRET').required().asString(),
};
//# sourceMappingURL=envs.js.map