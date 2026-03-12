"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const envs_1 = require("@config/envs");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, message: 'Token requerido' });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, envs_1.envs.JWT_SECRET);
        req.userId = payload.id;
        req.userRol = payload.rol;
        next();
    }
    catch {
        res.status(403).json({ success: false, message: 'Token inválido o expirado' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    const rol = req.userRol;
    if (rol !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Acceso restringido a administradores' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.middleware.js.map