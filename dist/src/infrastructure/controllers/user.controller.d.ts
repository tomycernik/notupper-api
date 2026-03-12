import { Request, Response } from 'express';
import { UserService } from '@application/services/user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    getMe(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map