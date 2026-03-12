import { Request, Response, NextFunction } from 'express';
type ClassConstructor<T> = new (...args: any[]) => T;
export declare const validateBody: <T extends object>(DtoClass: ClassConstructor<T>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=validate-body.middleware.d.ts.map