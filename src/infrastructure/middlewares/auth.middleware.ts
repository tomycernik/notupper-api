import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envs } from '@config/envs';

export interface JwtPayload {
  id: string;
  rol: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Token requerido' });
    return;
  }

  try {
    const payload = jwt.verify(token, envs.JWT_SECRET) as JwtPayload;
    (req as any).userId = payload.id;
    (req as any).userRol = payload.rol;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const rol = (req as any).userRol;
  if (rol !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Acceso restringido a administradores' });
    return;
  }
  next();
};
