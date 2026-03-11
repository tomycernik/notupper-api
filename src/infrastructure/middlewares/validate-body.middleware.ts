import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

type ClassConstructor<T> = new (...args: any[]) => T;

export const validateBody = <T extends object>(DtoClass: ClassConstructor<T>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await validate(instance as object);

    if (errors.length > 0) {
      const messages = errors.map(e => Object.values(e.constraints ?? {}).join(', '));
      res.status(400).json({ success: false, errors: messages });
      return;
    }

    req.body = instance;
    next();
  };
