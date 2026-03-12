import { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    id: string;
    rol: string;
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map